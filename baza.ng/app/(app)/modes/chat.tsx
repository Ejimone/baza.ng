import { useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    useWindowDimensions,
    View,
} from "react-native";
import ProductDetailSheet from "../../../components/chat/ProductDetailSheet";
import ImageViewerModal from "../../../components/chat/ImageViewerModal";
import ProductImage from "../../../components/ui/ProductImage";
import { useProducts } from "../../../hooks/useProducts";
import { useCartStore } from "../../../stores/cartStore";
import * as aiService from "../../../services/ai";
import { chatMode as s } from "../../../styles";
import {
    logToolCalls,
    logCartSync,
    logError,
    logWarn,
    logToolFailure,
} from "../../../utils/aiChatLogger";
import type {
    AIChatMessage,
    AIMessageType,
    AISuggestion,
} from "../../../types";
import { SHOPPING_MODES } from "../../../utils/constants";
import { formatPrice } from "../../../utils/format";

interface ChatProductItem {
  id: string;
  name: string;
  price?: number;
  priceFormatted?: string;
  category?: string;
  imageUrl?: string;
  inStock?: boolean;
}

interface ChatOrderMeta {
  orderId?: string;
  status?: string;
  totalFormatted?: string;
  eta?: string;
  walletFormatted?: string;
}

interface ChatMessage {
  id: string;
  text: string;
  from: "user" | "ai";
  messageType?: AIMessageType;
  toolName?: string;
  toolCalls?: Array<{ name: string; arguments?: Record<string, unknown> }>;
  options?: string[];
  items?: ChatProductItem[];
  order?: ChatOrderMeta;
  createdAt?: string;
  failedPayload?: string;
}

interface SuggestionCard {
  id: string;
  prompt: string;
  title: string;
  subtitle: string;
  imageUrl?: string;
}

interface CatalogLookupItem {
  id: string;
  name: string;
  imageUrl?: string;
  category?: string;
  price?: number;
}

const DEFAULT_QUICK_REPLIES = [
  "What should I cook tonight",
  "I need to restock",
  "Something quick to eat",
  "Help me plan meals",
];

const toPlainText = (value: string) =>
  value
    .replace(/[^\x20-\x7E]/g, "")
    .replace(/\s+/g, " ")
    .trim();

const sanitizeChatText = (value: string) => toPlainText(value);

const stripMarkdownAndLinks = (value: string) =>
  value
    .replace(/\*\*/g, "")
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/\n{2,}/g, "\n")
    .replace(/\s+/g, " ")
    .trim();

const CART_TOOLS = [
  "add_to_cart",
  "view_cart",
  "remove_from_cart",
  "clear_cart",
  "checkout_cart",
];

const CART_CTA_TOOLS = ["add_to_cart", "view_cart", "checkout_cart"];

const hasCartCta = (toolCalls?: Array<{ name?: string }>) => {
  if (!toolCalls?.length) return false;
  return toolCalls.some((tc) =>
    CART_CTA_TOOLS.includes((tc.name ?? "").toLowerCase()),
  );
};

const hasCheckoutOrderCta = (
  toolCalls?: Array<{ name?: string }>,
  order?: { orderId?: string },
) => {
  if (!order?.orderId) return false;
  return toolCalls?.some(
    (tc) => (tc.name ?? "").toLowerCase() === "checkout_cart",
  );
};

const isProductListingTool = (toolName?: string) => {
  if (!toolName) return true;
  const t = toolName.toLowerCase();
  return !CART_TOOLS.includes(t);
};

const formatAssistantContent = (
  content: string,
  messageType?: AIMessageType,
  items?: ChatProductItem[],
  toolName?: string,
) => {
  if (
    messageType === "product_list" &&
    items &&
    items.length > 0 &&
    isProductListingTool(toolName)
  ) {
    const base = toolName
      ? `Found ${items.length} ${toPlainText(toolName).replace("list_", "").replace("_", " ")} options.`
      : `Found ${items.length} product options.`;
    return `${base} Tap any card below to open details.`;
  }

  const cleaned = sanitizeChatText(stripMarkdownAndLinks(content));
  return cleaned.length > 460 ? `${cleaned.slice(0, 457)}...` : cleaned;
};

const WHATSAPP = {
  bubbleUser: "#dcf8c6",
  bubbleBot: "#ffffff",
  text: "#111b21",
  textSecondary: "#667781",
  border: "#e9edef",
  green: "#25d366",
};

export default function ChatScreen() {
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();
  const fetchCart = useCartStore((s) => s.fetchCart);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      text: "Hey Im Bazas assistant. What are we doing today? Cooking, restocking, or still figuring it out?",
      from: "ai",
      createdAt: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, number>
  >({});
  const [selectedProductForDetail, setSelectedProductForDetail] = useState<
    ChatProductItem | null
  >(null);
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const {
    bundles,
    mealPacks,
    readyEat,
    snacks,
    restockItems,
    fetchBundles,
    fetchMealPacks,
    fetchReadyEat,
    fetchSnacks,
    fetchRestock,
  } = useProducts();

  const modeByKey = {
    stockup: SHOPPING_MODES.find((mode) => mode.key === "stockup"),
    cookmeal: SHOPPING_MODES.find((mode) => mode.key === "cookmeal"),
    readyeat: SHOPPING_MODES.find((mode) => mode.key === "readyeat"),
    snacks: SHOPPING_MODES.find((mode) => mode.key === "snacks"),
    shoplist: SHOPPING_MODES.find((mode) => mode.key === "shoplist"),
    chat: SHOPPING_MODES.find((mode) => mode.key === "chat"),
  } as const;

  const mapSuggestionToCard = (
    suggestionText: string,
    action?: string,
    index?: number,
  ): SuggestionCard => {
    const cleanText = toPlainText(suggestionText);
    const actionKey = (action ?? "").toLowerCase();
    const textKey = cleanText.toLowerCase();

    let mapped = modeByKey.chat;
    if (actionKey.includes("meal") || textKey.includes("meal")) {
      mapped = modeByKey.cookmeal;
    } else if (actionKey.includes("snack") || textKey.includes("snack")) {
      mapped = modeByKey.snacks;
    } else if (
      actionKey.includes("browse_products") ||
      textKey.includes("browse") ||
      textKey.includes("product")
    ) {
      mapped = modeByKey.shoplist;
    } else if (textKey.includes("ready") || textKey.includes("eat")) {
      mapped = modeByKey.readyeat;
    } else if (textKey.includes("restock") || textKey.includes("bundle")) {
      mapped = modeByKey.stockup;
    }

    return {
      id: `suggestion_card_${index ?? 0}_${cleanText}`,
      prompt: cleanText,
      title: mapped?.title ?? cleanText,
      subtitle: mapped?.subtitle ?? "ASK AI FOR RECOMMENDATIONS",
      imageUrl: mapped?.imageUrl,
    };
  };

  useEffect(() => {
    loadAiContext();
  }, []);

  useEffect(() => {
    void Promise.allSettled([
      fetchBundles({ background: true }),
      fetchMealPacks({ background: true }),
      fetchReadyEat({ background: true }),
      fetchSnacks(undefined, { background: true }),
      fetchRestock(undefined, undefined, { background: true }),
    ]);
  }, [fetchBundles, fetchMealPacks, fetchReadyEat, fetchSnacks, fetchRestock]);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages, isTyping]);

  const loadAiContext = async () => {
    try {
      const [quickSuggestions, sessionsData] = await Promise.all([
        aiService.getSuggestions(),
        aiService.listSessions(1, 1),
      ]);

      setSuggestions(quickSuggestions);

      const latestSession = sessionsData.sessions[0];
      if (latestSession?.id) {
        setSessionId(latestSession.id);
        const history = await aiService.getHistory(latestSession.id, 1, 50);
        const loaded: ChatMessage[] = history.messages.map(
          (m: AIChatMessage) => ({
            id: m.id,
            text: formatAssistantContent(
              m.content,
              m.messageType,
              m.metadata?.items,
              m.metadata?.toolName,
            ),
            from: m.role === "user" ? "user" : "ai",
            messageType: m.messageType,
            toolName: m.metadata?.toolName,
            toolCalls: m.metadata?.toolCalls,
            options: m.metadata?.options?.map((option) => toPlainText(option)),
            items: m.metadata?.items?.map((item) => ({
              ...item,
              name: sanitizeChatText(item.name),
              category: item.category
                ? toPlainText(item.category)
                : item.category,
            })),
            order: m.metadata?.order ?? undefined,
            createdAt: m.createdAt,
          }),
        );
        setMessages(loaded);
        setShowQuickReplies(false);
      }
    } catch {
      // Keep welcome message on error
    }
  };

  const send = async (text: string = input) => {
    if (!text.trim()) return;

    const payload = text.trim();
    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      text: sanitizeChatText(payload),
      from: "user",
      messageType: "text",
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);
    setShowQuickReplies(false);

    try {
      const response = await aiService.sendChat(
        payload,
        sessionId ?? undefined,
      );
      setSessionId(response.session.id);

      const aiMsg: ChatMessage = {
        id: response.message.id,
        text: formatAssistantContent(
          response.message.content,
          response.message.messageType,
          response.message.metadata?.items,
          response.message.metadata?.toolName,
        ),
        from: "ai",
        messageType: response.message.messageType,
        toolName: response.message.metadata?.toolName,
        toolCalls: response.message.metadata?.toolCalls,
        options: response.message.metadata?.options?.map((option) =>
          toPlainText(option),
        ),
        items: response.message.metadata?.items?.map((item) => ({
          ...item,
          name: sanitizeChatText(item.name),
          category: item.category ? toPlainText(item.category) : item.category,
        })),
        order: response.message.metadata?.order ?? undefined,
        createdAt: response.message.createdAt,
      };

      const meta = response.message.metadata ?? {};
      const toolCalls = (meta.toolCalls ?? meta.tool_calls ?? []) as Array<{
        name?: string;
        arguments?: Record<string, unknown>;
      }>;
      const toolResults = (meta.toolResults ?? meta.tool_results ?? []) as Array<{
        name?: string;
        result?: unknown;
        error?: string;
      }>;

      logToolCalls(toolCalls, `user: "${payload.slice(0, 50)}..."`);
      if (toolResults.length > 0) {
        toolResults.forEach((tr, i) => {
          if (tr.error) {
            logError(`tool ${tr.name ?? "unknown"}`, tr.error);
          }
        });
      }

      const cartTools = [
        "add_to_cart",
        "view_cart",
        "remove_from_cart",
        "clear_cart",
        "checkout_cart",
      ];
      const hasCartTool = toolCalls.some((tc) =>
        cartTools.includes((tc.name ?? "").toLowerCase()),
      );
      if (hasCartTool) {
        logCartSync(`tools: ${toolCalls.map((t) => t.name).join(", ")}`);
        void fetchCart();
      }

      if (
        response.message.content?.toLowerCase().includes("error") ||
        response.message.content?.toLowerCase().includes("sorry")
      ) {
        logWarn("AI reported error in content", {
          content: response.message.content,
          toolCalls,
          toolResults,
        });
        if (toolCalls.length > 0 && toolResults.length > 0) {
          logToolFailure(toolCalls, toolResults);
        }
      }

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      logError("send message", err);
      const errMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        text: "Sorry, I couldn't process that. Try again?",
        from: "ai",
        messageType: "error",
        failedPayload: payload,
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const quickSuggestionCards: SuggestionCard[] =
    suggestions.length > 0
      ? suggestions
          .map((suggestion, index) =>
            mapSuggestionToCard(suggestion.text, suggestion.action, index),
          )
          .filter((suggestion) => suggestion.prompt.length > 0)
      : DEFAULT_QUICK_REPLIES.map((reply, index) =>
          mapSuggestionToCard(reply, undefined, index),
        );

  const suggestionCardSize = Math.max(
    132,
    Math.min(176, Math.floor(screenWidth * 0.42)),
  );

  const catalogIndex = useMemo(() => {
    const items: CatalogLookupItem[] = [
      ...restockItems.map((item) => ({
        id: item.id,
        name: item.name,
        imageUrl: item.imageUrl,
        category: item.category,
        price: item.price,
      })),
      ...snacks.map((item) => ({
        id: item.id,
        name: item.name,
        imageUrl: item.imageUrl,
        category: item.category,
        price: item.price,
      })),
      ...readyEat.map((item) => ({
        id: item.id,
        name: item.name,
        imageUrl: item.imageUrl,
        category: "Ready to Eat",
        price: item.price,
      })),
      ...mealPacks.map((item) => ({
        id: item.id,
        name: item.name,
        imageUrl: item.imageUrl,
        category: "Meal Pack",
        price: item.basePrice,
      })),
      ...bundles.map((item) => ({
        id: item.id,
        name: item.name,
        imageUrl: item.imageUrl,
        category: "Bundle",
        price: item.basePrice,
      })),
    ];

    const byId = new Map<string, CatalogLookupItem>();
    const byName = new Map<string, CatalogLookupItem>();

    items.forEach((item) => {
      byId.set(item.id, item);
      byName.set(item.name.trim().toLowerCase(), item);
    });

    return { byId, byName };
  }, [bundles, mealPacks, readyEat, snacks, restockItems]);

  const resolveChatProductItem = (item: ChatProductItem): ChatProductItem => {
    const fromId = catalogIndex.byId.get(item.id);
    const fromName = catalogIndex.byName.get(item.name.trim().toLowerCase());
    const catalogItem = fromId ?? fromName;

    return {
      ...item,
      imageUrl: item.imageUrl || catalogItem?.imageUrl,
      category: item.category || catalogItem?.category,
      price: typeof item.price === "number" ? item.price : catalogItem?.price,
      inStock: typeof item.inStock === "boolean" ? item.inStock : true,
    };
  };

  const clearChat = async () => {
    setIsTyping(false);
    setSelectedOptions({});
    setInput("");
    setShowQuickReplies(true);

    try {
      const newSession = await aiService.createSession("New chat");
      setSessionId(newSession.id);
    } catch {
      setSessionId(null);
    }

    setMessages([
      {
        id: `welcome_${Date.now()}`,
        text: "Hey Im Bazas assistant. What are we doing today?",
        from: "ai",
        createdAt: new Date().toISOString(),
      },
    ]);
  };

  const detectProductType = (item?: ChatProductItem): string => {
    const category = (item?.category ?? "").toLowerCase();
    if (category.includes("bundle")) return "bundle";
    if (category.includes("meal")) return "mealpack";
    if (category.includes("ready")) return "readyeat";
    if (category.includes("snack") || category.includes("drink"))
      return "snack";
    return "product";
  };

  const openProductInChat = (item: ChatProductItem) => {
    setSelectedProductForDetail(item);
  };

  const handleAddToCartFromSheet = async (item: ChatProductItem) => {
    setSelectedProductForDetail(null);
    const productType = detectProductType(item) as "bundle" | "mealpack" | "readyeat" | "snack" | "product";

    try {
      await useCartStore.getState().addItem({
        productId: item.id,
        itemType: productType,
        qty: 1,
      });
      setMessages((prev) => [
        ...prev,
        {
          id: `cart_added_${Date.now()}`,
          text: `Added ${item.name} to your cart.`,
          from: "ai",
          createdAt: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      logError("addToCartFromSheet", {
        productId: item.id,
        productName: item.name,
        itemType: productType,
        error: err,
      });
      setMessages((prev) => [
        ...prev,
        {
          id: `cart_err_${Date.now()}`,
          text: "Could not add to cart. Please try again.",
          from: "ai",
          messageType: "error",
          createdAt: new Date().toISOString(),
        },
      ]);
    }
  };

  const formatTime = (iso?: string) => {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={0}
    >
      <View className={s.container}>
        <View className={s.header}>
          <Pressable onPress={() => router.back()}>
            <Text className={s.backButton}>Back</Text>
          </Pressable>
          <View className={s.avatar}>
            <Text style={{ fontSize: 16, color: "#fff" }}>AI</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text className={s.headerName}>Baza Assistant</Text>
            <Text className={s.headerStatus}>Online</Text>
          </View>
          <Pressable
            onPress={clearChat}
            style={{
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.3)",
              backgroundColor: "rgba(255,255,255,0.2)",
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 6,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 10, letterSpacing: 0.4 }}>
              Clear Chat
            </Text>
          </Pressable>
        </View>

        <ScrollView
          ref={scrollRef}
          className={s.messageList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 16 }}
        >
          {messages.map((msg) => (
            <View
              key={msg.id}
              className={`${s.messageRow} ${msg.from === "user" ? s.messageRowUser : s.messageRowBot}`}
            >
              <View
                className={
                  msg.from === "user" ? s.messageBubbleUser : s.messageBubbleBot
                }
                style={{
                  backgroundColor:
                    msg.from === "user" ? WHATSAPP.bubbleUser : WHATSAPP.bubbleBot,
                  borderRadius: msg.from === "user" ? "8px 0 8px 8px" : "0 8px 8px 8px",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: msg.from === "ai" ? 0.02 : 0,
                  shadowRadius: 2,
                  elevation: 1,
                }}
              >
                <Text
                  style={{
                    color: WHATSAPP.text,
                    fontSize: 12,
                    lineHeight: 20,
                  }}
                >
                  {msg.text}
                </Text>

                {msg.from === "ai" &&
                msg.messageType === "order_summary" &&
                msg.order ? (
                  <View
                    style={{
                      marginTop: 12,
                      padding: 12,
                      backgroundColor: "#f0f2f5",
                      borderRadius: 8,
                      gap: 6,
                    }}
                  >
                    {msg.order.orderId && (
                      <Text style={{ fontSize: 11, color: WHATSAPP.textSecondary }}>
                        Order: {toPlainText(msg.order.orderId)}
                      </Text>
                    )}
                    {msg.order.status && (
                      <Text style={{ fontSize: 11, color: WHATSAPP.text }}>
                        Status: {toPlainText(msg.order.status)}
                      </Text>
                    )}
                    {msg.order.totalFormatted && (
                      <Text style={{ fontSize: 12, fontWeight: "600", color: WHATSAPP.text }}>
                        Total: {toPlainText(msg.order.totalFormatted)}
                      </Text>
                    )}
                    {msg.order.eta && (
                      <Text style={{ fontSize: 10, color: WHATSAPP.textSecondary }}>
                        ETA: {toPlainText(msg.order.eta)}
                      </Text>
                    )}
                    {msg.order.walletFormatted && (
                      <Text style={{ fontSize: 10, color: WHATSAPP.textSecondary }}>
                        Wallet: {toPlainText(msg.order.walletFormatted)}
                      </Text>
                    )}
                    <Pressable
                      onPress={() => router.push("/(app)/orders" as any)}
                      style={{
                        marginTop: 10,
                        paddingVertical: 8,
                        paddingHorizontal: 12,
                        backgroundColor: WHATSAPP.green,
                        borderRadius: 8,
                        alignSelf: "flex-start",
                      }}
                    >
                      <Text style={{ fontSize: 11, fontWeight: "600", color: "#fff" }}>
                        View Orders
                      </Text>
                    </Pressable>
                  </View>
                ) : null}

                {msg.from === "ai" &&
                hasCartCta(msg.toolCalls) &&
                !hasCheckoutOrderCta(msg.toolCalls, msg.order) ? (
                  <View style={{ marginTop: 10, flexDirection: "row", gap: 8 }}>
                    <Pressable
                      onPress={() => router.push("/(app)/cart" as any)}
                      style={{
                        paddingVertical: 8,
                        paddingHorizontal: 12,
                        backgroundColor: WHATSAPP.green,
                        borderRadius: 8,
                      }}
                    >
                      <Text style={{ fontSize: 11, fontWeight: "600", color: "#fff" }}>
                        View Cart
                      </Text>
                    </Pressable>
                  </View>
                ) : null}

                {msg.from === "ai" &&
                hasCheckoutOrderCta(msg.toolCalls, msg.order) &&
                msg.messageType !== "order_summary" ? (
                  <View style={{ marginTop: 10, flexDirection: "row", gap: 8 }}>
                    <Pressable
                      onPress={() => router.push("/(app)/orders" as any)}
                      style={{
                        paddingVertical: 8,
                        paddingHorizontal: 12,
                        backgroundColor: WHATSAPP.green,
                        borderRadius: 8,
                      }}
                    >
                      <Text style={{ fontSize: 11, fontWeight: "600", color: "#fff" }}>
                        View Order
                      </Text>
                    </Pressable>
                  </View>
                ) : null}

                {msg.from === "ai" &&
                msg.messageType === "product_list" &&
                msg.items?.length &&
                isProductListingTool(msg.toolName) ? (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={{ marginTop: 10 }}
                    contentContainerStyle={{ gap: 10, paddingRight: 4 }}
                  >
                    {msg.items.slice(0, 10).map((item, itemIndex) => {
                      const resolvedItem = resolveChatProductItem(item);
                      const fallbackEmoji =
                        resolvedItem.name?.trim()?.charAt(0)?.toUpperCase() ||
                        "P";

                      return (
                        <Pressable
                          key={`${msg.id}_item_${itemIndex}_${item.id}`}
                          onPress={() => openProductInChat(resolvedItem)}
                          style={{
                            width: 152,
                            borderWidth: 1,
                            borderColor: WHATSAPP.border,
                            backgroundColor: WHATSAPP.bubbleBot,
                            borderRadius: 8,
                            overflow: "hidden",
                          }}
                        >
                          <ProductImage
                            imageUrl={resolvedItem.imageUrl}
                            emoji={fallbackEmoji}
                            size={152}
                            borderRadius={0}
                          />

                          <View style={{ padding: 10, gap: 4 }}>
                            <Text
                              numberOfLines={2}
                              style={{
                                color: WHATSAPP.text,
                                fontSize: 11,
                                lineHeight: 16,
                              }}
                            >
                              {resolvedItem.name}
                            </Text>

                            <Text
                              numberOfLines={1}
                              style={{
                                color: WHATSAPP.textSecondary,
                                fontSize: 9,
                              }}
                            >
                              {resolvedItem.category
                                ? toPlainText(resolvedItem.category)
                                : "Product"}
                            </Text>

                            <View
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-between",
                                marginTop: 2,
                              }}
                            >
                              <Text
                                style={{
                                  color: WHATSAPP.text,
                                  fontSize: 10,
                                }}
                              >
                                {resolvedItem.priceFormatted ??
                                  (typeof resolvedItem.price === "number"
                                    ? formatPrice(resolvedItem.price)
                                    : "")}
                              </Text>
                              <Text
                                style={{
                                  color:
                                    resolvedItem.inStock === false
                                      ? "#e85c3a"
                                      : WHATSAPP.green,
                                  fontSize: 8,
                                }}
                              >
                                {resolvedItem.inStock === false
                                  ? "Out"
                                  : "View"}
                              </Text>
                            </View>
                          </View>
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                ) : null}

                {msg.from === "ai" &&
                msg.messageType === "mcq" &&
                msg.options?.length ? (
                  <View style={{ marginTop: 10, gap: 8 }}>
                    {msg.options.map((option, optionIndex) => {
                      const selectedIndex = selectedOptions[msg.id];
                      const isSelected = selectedIndex === optionIndex;
                      const hasSelected = selectedIndex !== undefined;

                      return (
                        <Pressable
                          key={`${msg.id}_option_${optionIndex}_${option}`}
                          className={s.quickReplyBtn}
                          style={{
                            borderColor: isSelected
                              ? `${WHATSAPP.green}99`
                              : WHATSAPP.border,
                            backgroundColor: isSelected
                              ? `${WHATSAPP.green}22`
                              : "transparent",
                            opacity: hasSelected && !isSelected ? 0.7 : 1,
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 8,
                          }}
                          disabled={hasSelected}
                          onPress={() => {
                            setSelectedOptions((prev) => ({
                              ...prev,
                              [msg.id]: optionIndex,
                            }));
                            send(toPlainText(option));
                          }}
                        >
                          <View
                            style={{
                              width: 12,
                              height: 12,
                              borderRadius: 6,
                              borderWidth: 1,
                              borderColor: isSelected
                                ? WHATSAPP.green
                                : WHATSAPP.textSecondary,
                              backgroundColor: isSelected
                                ? WHATSAPP.green
                                : "transparent",
                            }}
                          />
                          <Text
                            style={{
                              color: WHATSAPP.textSecondary,
                              fontSize: 10,
                              letterSpacing: 0.5,
                            }}
                          >
                            {toPlainText(option)}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                ) : null}

                {msg.from === "ai" && msg.messageType === "confirmation" ? (
                  <View style={{ marginTop: 10, flexDirection: "row", gap: 8 }}>
                    <Pressable
                      className={s.quickReplyBtn}
                      onPress={() => send("Yes, place the order")}
                    >
                      <Text
                        style={{
                          color: WHATSAPP.textSecondary,
                          fontSize: 10,
                          letterSpacing: 0.5,
                        }}
                      >
                        Confirm
                      </Text>
                    </Pressable>
                    <Pressable
                      className={s.quickReplyBtn}
                      onPress={() => send("No, cancel")}
                    >
                      <Text
                        style={{
                          color: WHATSAPP.textSecondary,
                          fontSize: 10,
                          letterSpacing: 0.5,
                        }}
                      >
                        Cancel
                      </Text>
                    </Pressable>
                  </View>
                ) : null}

                {msg.from === "ai" &&
                msg.messageType === "error" &&
                msg.failedPayload ? (
                  <Pressable
                    onPress={() => send(msg.failedPayload!)}
                    style={{
                      marginTop: 10,
                      paddingVertical: 8,
                      paddingHorizontal: 12,
                      backgroundColor: WHATSAPP.green,
                      borderRadius: 8,
                      alignSelf: "flex-start",
                    }}
                  >
                    <Text style={{ fontSize: 11, fontWeight: "600", color: "#fff" }}>
                      Retry
                    </Text>
                  </Pressable>
                ) : null}
              </View>
              {formatTime(msg.createdAt) ? (
                <Text
                  style={{
                    fontSize: 10,
                    color: WHATSAPP.textSecondary,
                    marginTop: 2,
                    alignSelf: msg.from === "user" ? "flex-end" : "flex-start",
                  }}
                >
                  {formatTime(msg.createdAt)}
                </Text>
              ) : null}
            </View>
          ))}

          {isTyping && (
            <View className={`${s.messageRow} ${s.messageRowBot}`}>
              <View className={s.typingIndicator}>
                <View className={s.typingDot} />
                <View className={s.typingDot} style={{ opacity: 0.6 }} />
                <View className={s.typingDot} style={{ opacity: 0.3 }} />
              </View>
            </View>
          )}
        </ScrollView>

        {showQuickReplies && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className={s.quickReplies}
            contentContainerStyle={{ gap: 10, paddingRight: 16 }}
          >
            {quickSuggestionCards.map((card, cardIndex) => (
              <Pressable
                key={`${card.id}_${cardIndex}`}
                onPress={() => send(card.prompt)}
                style={{
                  width: suggestionCardSize,
                  height: suggestionCardSize,
                  borderWidth: 1,
                  borderColor: WHATSAPP.border,
                  borderRadius: 8,
                  overflow: "hidden",
                  backgroundColor: WHATSAPP.bubbleBot,
                }}
              >
                <ProductImage
                  imageUrl={card.imageUrl}
                  emoji=""
                  size={suggestionCardSize}
                  borderRadius={0}
                />

                <View
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: 0,
                    paddingHorizontal: 8,
                    paddingVertical: 8,
                    backgroundColor: "rgba(255,255,255,0.95)",
                  }}
                >
                  <Text
                    numberOfLines={1}
                    style={{
                      color: WHATSAPP.text,
                      fontSize: 11,
                    }}
                  >
                    {toPlainText(card.title)}
                  </Text>
                  <Text
                    numberOfLines={2}
                    style={{
                      color: WHATSAPP.textSecondary,
                      fontSize: 8,
                      marginTop: 2,
                    }}
                  >
                    {toPlainText(card.subtitle)}
                  </Text>
                </View>

                <Text
                  style={{
                    position: "absolute",
                    top: 8,
                    left: 8,
                    color: WHATSAPP.text,
                    fontSize: 9,
                    letterSpacing: 0.4,
                    backgroundColor: "rgba(255,255,255,0.9)",
                    paddingHorizontal: 6,
                    paddingVertical: 3,
                    borderRadius: 4,
                  }}
                >
                  {toPlainText(card.prompt)}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        )}

        <View className={s.inputBar}>
          <TextInput
            className={s.input}
            value={input}
            onChangeText={setInput}
            placeholder="Type a message"
            placeholderTextColor={WHATSAPP.textSecondary}
            returnKeyType="send"
            onSubmitEditing={() => send()}
          />
          <Pressable
            className={s.sendBtn}
            style={{
              opacity: input.trim() ? 1 : 0.5,
            }}
            onPress={() => send()}
            disabled={!input.trim()}
          >
            <Text style={{ fontSize: 11, color: "#fff" }}>Send</Text>
          </Pressable>
        </View>
      </View>

      <ProductDetailSheet
        visible={!!selectedProductForDetail}
        onClose={() => setSelectedProductForDetail(null)}
        item={selectedProductForDetail}
        onAddToCart={handleAddToCartFromSheet}
        onViewImage={(url) => setSelectedImageUri(url)}
      />

      <ImageViewerModal
        visible={!!selectedImageUri}
        onClose={() => setSelectedImageUri(null)}
        imageUrl={selectedImageUri}
      />
    </KeyboardAvoidingView>
  );
}
