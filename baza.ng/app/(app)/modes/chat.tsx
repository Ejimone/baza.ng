import { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { chatMode as s } from "../../../styles";
import * as supportService from "../../../services/support";
import type { SupportMessage } from "../../../types";

interface ChatMessage {
  id: string;
  text: string;
  from: "user" | "ai";
}

const QUICK_REPLIES = [
  "What should I cook tonight?",
  "I need to restock",
  "Something quick to eat",
  "Help me plan meals",
];

export default function ChatScreen() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      text: "Hey! I'm Baza's assistant. What are we doing today? Cooking, restocking, or still figuring it out?",
      from: "ai",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    loadThread();
  }, []);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages, isTyping]);

  const loadThread = async () => {
    try {
      const thread = await supportService.getThread();
      if (thread.messages.length > 0) {
        const loaded: ChatMessage[] = thread.messages.map((m: SupportMessage) => ({
          id: m.id,
          text: m.text,
          from: m.sender === "USER" ? "user" as const : "ai" as const,
        }));
        setMessages(loaded);
        setShowQuickReplies(false);
      }
    } catch {
      // Keep welcome message on error
    }
  };

  const send = async (text: string = input) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      text: text.trim(),
      from: "user",
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);
    setShowQuickReplies(false);

    try {
      const response = await supportService.sendMessage(text.trim());
      const aiMsg: ChatMessage = {
        id: response.aiReply.id,
        text: response.aiReply.text,
        from: "ai",
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const errMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        text: "Sorry, I couldn't process that. Try again?",
        from: "ai",
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsTyping(false);
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
            <Text className={s.backButton}>←</Text>
          </Pressable>
          <View className={s.avatar}>
            <Text style={{ fontSize: 16 }}>🤖</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text className={s.headerName}>Baza Assistant</Text>
            <Text className={s.headerStatus}>● ONLINE</Text>
          </View>
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
                  msg.from === "user"
                    ? s.messageBubbleUser
                    : s.messageBubbleBot
                }
              >
                <Text style={{ color: "#d0d8e0", fontSize: 12, lineHeight: 20 }}>
                  {msg.text}
                </Text>
              </View>
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
          >
            {QUICK_REPLIES.map((reply) => (
              <Pressable
                key={reply}
                className={s.quickReplyBtn}
                onPress={() => send(reply)}
              >
                <Text style={{ color: "#6ec6ff", fontSize: 10, letterSpacing: 0.5 }}>
                  {reply}
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
            placeholder="Type anything..."
            placeholderTextColor="#3a5a8a"
            returnKeyType="send"
            onSubmitEditing={() => send()}
          />
          <Pressable
            className={s.sendBtn}
            onPress={() => send()}
            disabled={!input.trim()}
            style={{ opacity: input.trim() ? 1 : 0.5 }}
          >
            <Text style={{ fontSize: 14, color: "#000" }}>↑</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
