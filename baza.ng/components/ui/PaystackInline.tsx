import { useRef, useState } from "react";
import { ActivityIndicator, Modal, Pressable, Text, View } from "react-native";
import { WebView, type WebViewMessageEvent } from "react-native-webview";

interface PaystackInlineProps {
  visible: boolean;
  publicKey: string;
  email: string;
  /** Amount in kobo (₦1 = 100 kobo) */
  amount: number;
  reference?: string;
  metadata?: Record<string, unknown>;
  onSuccess: (data: { reference: string; message: string }) => void;
  onCancel: () => void;
  onError?: (error: string) => void;
}

/**
 * Paystack Inline payment component for React Native.
 * Renders Paystack's inline.js checkout inside a WebView modal.
 */
export default function PaystackInline({
  visible,
  publicKey,
  email,
  amount,
  reference,
  metadata,
  onSuccess,
  onCancel,
  onError,
}: PaystackInlineProps) {
  const webViewRef = useRef<WebView>(null);
  const [isLoading, setIsLoading] = useState(true);

  const metaString = metadata ? JSON.stringify(metadata) : "{}";
  const ref =
    reference ??
    `baza_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: #060d07;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      color: #d0e0d0;
    }
    .loading {
      text-align: center;
      font-size: 13px;
      letter-spacing: 2px;
      color: #3a5c3a;
      text-transform: uppercase;
    }
    .loading .spinner {
      width: 32px;
      height: 32px;
      border: 2px solid #1a2a1c;
      border-top-color: #4caf7d;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto 16px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <div class="loading" id="loader">
    <div class="spinner"></div>
    INITIALISING PAYMENT...
  </div>
  <script src="https://js.paystack.co/v2/inline.js"></script>
  <script>
    (function() {
      try {
        var popup = new PaystackPop();
        popup.newTransaction({
          key: "${publicKey}",
          email: "${email}",
          amount: ${amount},
          currency: "NGN",
          reference: "${ref}",
          metadata: ${metaString},
          onSuccess: function(transaction) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: "success",
              reference: transaction.reference,
              message: transaction.message || "Payment successful"
            }));
          },
          onCancel: function() {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: "cancel"
            }));
          },
          onError: function(error) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: "error",
              message: error.message || "Payment failed"
            }));
          },
          onLoad: function() {
            document.getElementById("loader").style.display = "none";
          }
        });
      } catch(e) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: "error",
          message: e.message || "Failed to initialise Paystack"
        }));
      }
    })();
  </script>
</body>
</html>
  `.trim();

  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      switch (data.type) {
        case "success":
          onSuccess({ reference: data.reference, message: data.message });
          break;
        case "cancel":
          onCancel();
          break;
        case "error":
          if (onError) onError(data.message);
          else onCancel();
          break;
      }
    } catch {
      // ignore malformed messages
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onCancel}
    >
      <View style={{ flex: 1, backgroundColor: "#060d07" }}>
        {/* Header bar */}
        <View
          style={{
            paddingTop: 56,
            paddingBottom: 12,
            paddingHorizontal: 20,
            backgroundColor: "#060d07",
            borderBottomWidth: 1,
            borderBottomColor: "#1a2a1c",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text
            style={{
              color: "#2a4a2a",
              fontSize: 9,
              letterSpacing: 3,
              fontFamily: "SpaceMono_400Regular",
            }}
          >
            SECURE PAYMENT
          </Text>
          <Pressable onPress={onCancel} hitSlop={12}>
            <Text
              style={{
                color: "#5a3a3a",
                fontSize: 11,
                letterSpacing: 2,
                fontFamily: "SpaceMono_400Regular",
              }}
            >
              CANCEL
            </Text>
          </Pressable>
        </View>

        {/* WebView */}
        <WebView
          ref={webViewRef}
          originWhitelist={["*"]}
          source={{ html }}
          onMessage={handleMessage}
          onLoadEnd={() => setIsLoading(false)}
          javaScriptEnabled
          domStorageEnabled
          style={{ flex: 1, backgroundColor: "#060d07" }}
          scrollEnabled={false}
        />

        {isLoading && (
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#060d07",
            }}
          >
            <ActivityIndicator color="#4caf7d" size="large" />
            <Text
              style={{
                color: "#2a4a2a",
                fontSize: 9,
                letterSpacing: 3,
                marginTop: 16,
                fontFamily: "SpaceMono_400Regular",
              }}
            >
              LOADING PAYMENT...
            </Text>
          </View>
        )}
      </View>
    </Modal>
  );
}
