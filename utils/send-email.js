import mail from "@sendgrid/mail";

mail.setApiKey(process.env.SENDGRID_API_KEY);

const adminEmail = "contact@repsetter.com";
const notificationsEmail = "updates@repsetter.com";

export default async function sendEmail(...messages) {
  console.log(
    messages.map((message) => ({
      ...message,
      dynamicTemplateData: {
        email: message.to,
        subject: message.subject,
        ...message?.dynamicTemplateData,
      },
      templateId: process.env.SENDGRID_TEMPLATE_ID,
      from: {
        email: notificationsEmail,
        name: "Repsetter",
      },
      replyTo: adminEmail,
    }))
  );
  try {
    await mail.send(
      messages.map((message) => ({
        templateId: process.env.SENDGRID_TEMPLATE_ID,
        ...message,
        dynamicTemplateData: {
          email: message.to,
          subject: message.subject,
          ...message?.dynamicTemplateData,
        },
        from: {
          email: notificationsEmail,
          name: "Repsetter",
          ...message?.from,
        },
        replyTo: adminEmail,
      }))
    );
  } catch (error) {
    console.error(error);

    if (error.response) {
      console.error(error.response.body);
    }
  }
}

export async function emailAdmin(message) {
  sendEmail({
    ...message,
    to: adminEmail,
  });
}
