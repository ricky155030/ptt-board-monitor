const puppeteer = require('puppeteer')
const { sendPhoto, sendMessage } = require('./telegram')
const { promiseChain, filterPostWithinTime, getPostScreenshot, getPostUrlMultiPages } = require('./utils')

const boardName = process.argv[2]
const mainUrl = `/bbs/${boardName}/index.html`

let browser

const promiseFunc = post => async () => {
  await getPostScreenshot(browser)(post)
  await sendMessage(`[${post.boardName}] ${post.title}`)
  return sendPhoto(`./screenshots/${post.boardName}_${post.timestamp}.jpeg`)
}

(async () => {
  browser = await puppeteer.launch()

  getPostUrlMultiPages(2)(mainUrl)
    .then(filterPostWithinTime(240))
    .then(r => promiseChain(r.map(promiseFunc)))
    .then(() => browser.close())
    .catch(e => console.log(e))
})()
