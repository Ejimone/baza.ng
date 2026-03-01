import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";
import ScreenWrapper from "../../../components/layout/ScreenWrapper";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import { getThemePalette } from "../../../constants/appTheme";
import { colors } from "../../../constants/theme";
import * as supportService from "../../../services/support";
import { useThemeStore } from "../../../stores/themeStore";
import { supportChatScreen as s } from "../../../styles/index";
import type { SupportMessage } from "../../../types";

const QUICK_REPLIES = [
  "Track my order",
  "Something was missing",
  "Wallet issue",
  "Cancel an order",
  "Talk to a person",
];

export default function SupportScreen() {
  const router = useRouter();
  const mode = useThemeStore((state) => state.mode);
  const palette = getThemePalette(mode);
  const scrollRef = useRef<ScrollView>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [flagged, setFlagged] = useState(false);
  const [humanJoined, setHumanJoined] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const thread = await supportService.getThread();
        setMessages(thread.messages);
        setHumanJoined(thread.humanJoined);
        if (thread.messages.some((m) => m.flagged)) setFlagged(true);
      } catch {
        // thread may not exist yet — start fresh
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages, typing]);

  const showQuickReplies = messages.length <= 1;

  const send = async (text: string = input) => {
    if (!text.trim()) return;
    const userMsg: SupportMessage = {
      id: `tmp_${Date.now()}`,
      text: text.trim(),
      sender: "USER",
      flagged: false,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    try {
      const result = await supportService.sendMessage(text.trim());

      setMessages((prev) => {
        const withoutTemp = prev.filter((m) => m.id !== userMsg.id);
        const newMsgs: SupportMessage[] = [
          ...withoutTemp,
          {
            id: result.userMessage.id,
            text: result.userMessage.text,
            sender: "USER",
            flagged: false,
            createdAt: new Date().toISOString(),
          },
          {
            id: result.aiReply.id,
            text: result.aiReply.text,
            sender: "AI",
            flagged: result.aiReply.flagged,
            createdAt: new Date().toISOString(),
          },
        ];
        return newMsgs;
      });

      if (result.flagged && !flagged) setFlagged(true);
      if (result.humanJoined) setHumanJoined(true);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          text: "Sorry, something went wrong. Please try again.",
          sender: "AI",
          flagged: false,
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setTyping(false);
    }
  };

  const getStatusText = () => {
    if (humanJoined)
      return { text: "● TEAM MEMBER JOINED", style: s.headerStatusHuman };
    if (flagged)
      return { text: "● FLAGGING FOR TEAM", style: s.headerStatusFlagged };
    return { text: "● AI ASSISTANT", style: s.headerStatusAI };
  };

  const status = getStatusText();

  if (isLoading) {
    return (
      <ScreenWrapper className="bg-[#07090f]">
        <LoadingSpinner message="LOADING CHAT" color={colors.accent.blue} />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper className="bg-[#07090f]" padBottom>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        {/* Header */}
        <View
          className={s.header}
          style={{ borderBottomColor: palette.border }}
        >
          <Pressable onPress={() => router.back()}>
            <Text
              className={s.backButton}
              style={{ color: palette.textSecondary }}
            >
              {"←"}
            </Text>
          </Pressable>
          <View className={s.avatarBox}>
            <View
              className={s.avatar}
              style={{
                backgroundColor: palette.card,
                borderColor: palette.border,
              }}
            >
              <Text className="text-base">{"🤖"}</Text>
            </View>
            {humanJoined && <View className={s.humanDot} />}
          </View>
          <View className="flex-1">
            <Text
              className={s.headerName}
              style={{ color: palette.textPrimary }}
            >
              {humanJoined ? "Adaeze + Assistant" : "Baza Support"}
            </Text>
            <Text className={status.style}>{status.text}</Text>
          </View>
          {flagged && !humanJoined && (
            <Text className={s.flaggedBadge}>TEAM NOTIFIED</Text>
          )}
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollRef}
          className={s.messageList}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((msg) => {
            if (msg.sender === "SYSTEM") {
              return (
                <Text
                  key={msg.id}
                  className={s.systemMessage}
                  style={{ color: palette.textSecondary }}
                >
                  {msg.text}
                </Text>
              );
            }

            const isUser = msg.sender === "USER";
            const isHuman = msg.sender === "HUMAN_AGENT";

            return (
              <View
                key={msg.id}
                className={`${s.msgCol} ${isUser ? s.msgColUser : s.msgColAI}`}
              >
                {isHuman && (
                  <Text className={s.msgLabelHuman}>ADAEZE · BAZA TEAM</Text>
                )}
                {msg.sender === "AI" && (
                  <Text className={s.msgLabelAI}>BAZA AI</Text>
                )}
                <View
                  className={
                    isUser
                      ? s.msgBubbleUser
                      : isHuman
                        ? s.msgBubbleHuman
                        : s.msgBubbleAI
                  }
                  style={
                    isUser
                      ? {
                          borderColor: "#ff704333",
                          backgroundColor: "#ff704318",
                        }
                      : {
                          borderColor: palette.border,
                          backgroundColor: palette.card,
                        }
                  }
                >
                  <Text
                    className="text-xs leading-relaxed font-mono"
                    style={{ color: palette.textPrimary }}
                  >
                    {msg.text}
                  </Text>
                </View>
                {msg.flagged && (
                  <Text className={s.flaggedLabel}>
                    {"⚑ FLAGGED FOR TEAM REVIEW"}
                  </Text>
                )}
              </View>
            );
          })}

          {typing && (
            <View
              className={s.typingIndicator}
              style={{
                backgroundColor: palette.card,
                borderColor: palette.border,
              }}
            >
              <View
                className={s.typingDot}
                style={{ backgroundColor: palette.textSecondary }}
              />
              <View
                className={s.typingDot}
                style={{ backgroundColor: palette.textSecondary }}
              />
              <View
                className={s.typingDot}
                style={{ backgroundColor: palette.textSecondary }}
              />
            </View>
          )}
        </ScrollView>

        {/* Quick Replies */}
        {showQuickReplies && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className={s.quickReplies}
            contentContainerStyle={{ gap: 8 }}
          >
            {QUICK_REPLIES.map((qr) => (
              <Pressable key={qr} onPress={() => send(qr)}>
                <Text
                  className={s.quickReplyBtn}
                  style={{
                    borderColor: palette.border,
                    color: palette.textSecondary,
                  }}
                >
                  {qr}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        )}

        {/* Input Bar */}
        <View className={s.inputBar} style={{ borderTopColor: palette.border }}>
          <TextInput
            className={s.input}
            style={{
              backgroundColor: palette.card,
              borderColor: palette.border,
              color: palette.textPrimary,
            }}
            placeholder="Describe your issue..."
            placeholderTextColor={palette.textSecondary}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={() => send()}
            returnKeyType="send"
          />
          <Pressable onPress={() => send()}>
            <Text className={s.sendBtn}>{"↑"}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}
