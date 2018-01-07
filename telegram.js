const TelegramBot = require('node-telegram-bot-api')
const { botToken } = require('./config')

const bot = new TelegramBot(botToken, { polling: false })

const chatIds = [
  124155805
]

const sendPhoto = async path => Promise.all(
  chatIds.map(id => bot.sendPhoto(id, path))
)

const sendMessage = async message => Promise.all(
  chatIds.map(id => bot.sendMessage(id, message))
)

module.exports = {
  sendPhoto,
  sendMessage
}
