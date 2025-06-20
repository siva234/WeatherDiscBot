import { config } from 'dotenv';
import { Client, GatewayIntentBits, Message } from 'discord.js';
import axios from 'axios';

config();

const DISCORD_TOKEN = process.env.DISCORD_TOKEN as string;
const WEATHER_API_KEY = process.env.WEATHER_API_KEY as string;

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

client.once('ready', () => {
  console.log(`🤖 Logged in as ${client.user?.tag}`);
});

client.on('messageCreate', async (message: Message) => {
  if (!message.content.startsWith('!weather') || message.author.bot) return;

  const args = message.content.split(' ');
  const city = args.slice(1).join(' ');
  if (!city) {
    message.reply('Please provide a city. Example: `!weather London`');
    return;
  }

  try {
    const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
      params: {
        q: city,
        appid: WEATHER_API_KEY,
        units: 'metric'
      }
    });

    const weather = response.data;
    const description = weather.weather[0].description;
    const temp = weather.main.temp;
    const emoji = getWeatherEmoji(description);

    message.reply(`${emoji} Weather in **${weather.name}**: ${description}, **${temp}°C**`);
  } catch (error) {
    message.reply(`❌ Couldn't find weather for "${city}". Try a valid city name.`);
  }
});

function getWeatherEmoji(description: string): string {
  const desc = description.toLowerCase();
  if (desc.includes('cloud')) return '☁️';
  if (desc.includes('rain')) return '🌧️';
  if (desc.includes('sun') || desc.includes('clear')) return '☀️';
  if (desc.includes('snow')) return '❄️';
  return '🌈';
}

client.login(DISCORD_TOKEN);
