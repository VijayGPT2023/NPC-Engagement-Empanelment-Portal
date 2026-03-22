export interface SmsOptions {
  to: string;  // 10-digit Indian mobile number
  message: string;
}

type SmsProvider = "msg91" | "nic_gateway" | "console";

async function sendViaMSG91(options: SmsOptions): Promise<boolean> {
  const authKey = process.env.MSG91_AUTH_KEY;
  const senderId = process.env.MSG91_SENDER_ID || "NPCIND";
  const route = process.env.MSG91_ROUTE || "4"; // transactional

  if (!authKey) {
    console.warn("[SMS] MSG91_AUTH_KEY not configured");
    return false;
  }

  try {
    const response = await fetch("https://api.msg91.com/api/v5/flow/", {
      method: "POST",
      headers: {
        "authkey": authKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: senderId,
        route,
        mobiles: `91${options.to}`,
        message: options.message,
      }),
    });
    return response.ok;
  } catch (error) {
    console.error("[SMS] MSG91 error:", error);
    return false;
  }
}

async function sendViaNICGateway(options: SmsOptions): Promise<boolean> {
  const apiUrl = process.env.NIC_SMS_API_URL;
  const username = process.env.NIC_SMS_USERNAME;
  const password = process.env.NIC_SMS_PASSWORD;
  const senderId = process.env.NIC_SMS_SENDER_ID || "NPCIND";

  if (!apiUrl || !username) {
    console.warn("[SMS] NIC SMS Gateway not configured");
    return false;
  }

  try {
    const params = new URLSearchParams({
      username: username,
      pin: password || "",
      message: options.message,
      mnumber: options.to,
      signature: senderId,
    });
    const response = await fetch(`${apiUrl}?${params}`);
    return response.ok;
  } catch (error) {
    console.error("[SMS] NIC Gateway error:", error);
    return false;
  }
}

export async function sendSms(options: SmsOptions): Promise<boolean> {
  const provider: SmsProvider = (process.env.SMS_PROVIDER as SmsProvider) || "console";

  switch (provider) {
    case "msg91":
      return sendViaMSG91(options);
    case "nic_gateway":
      return sendViaNICGateway(options);
    case "console":
    default:
      console.log(`[SMS] (console mode) To: ${options.to}, Message: ${options.message}`);
      return true;
  }
}
