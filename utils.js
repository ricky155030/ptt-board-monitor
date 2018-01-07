const rp = require('request-promise')
const cheerio = require('cheerio')
const moment = require('moment')
const puppeteer = require('puppeteer')
const { sendPhoto, sendMessage } = require('./telegram')

const boardName = process.argv[2]
const pttPrefix = 'https://www.ptt.cc'
const currentTimestamp = parseInt(moment().unix(), 10)

const promiseChain = promises => promises.reduce((p, next) => p.then(next), Promise.resolve())

const parsePostUrl = html => {
  const $ = cheerio.load(html) 

  return $('.r-ent a')
    .map(function() {
      const title = $(this).text()
      const url =  $(this).attr('href')

      return { title, url, boardName }
    })
    .get()
}

const filterPostWithinTime = withinMinutes => postUrl => {
  const regexp = /M.(.*?).A/

  return postUrl
    .map(i => Object.assign(i, { timestamp: parseInt(i.url.match(regexp)[1], 10) }))
    .filter(i => (currentTimestamp - i.timestamp) < (60 * withinMinutes))
}

const getPrevPageUrl = html => {
  const $ = cheerio.load(html)
  return $('a.btn.wide').eq(1).attr('href')
}

const getPostUrlMultiPages = pageNum => async url => {
  const html = await rp(pttPrefix + url)

  const postUrl = parsePostUrl(html)
  const prevPageUrl = getPrevPageUrl(html)

  if(pageNum == 0) {
    return postUrl
  } else {
    return postUrl.concat(await getPostUrlMultiPages(pageNum - 1)(prevPageUrl))
  }
}

const getPostScreenshot = browser => async post => {
  const page = await browser.newPage()

  const screenshotOption = {
    quality: 50,
    type: 'jpeg',
    fullPage: true
  }

  screenshotOption.path = `./screenshots/${post.boardName}_${post.timestamp}.${screenshotOption.type}` 

  await page.goto(pttPrefix + post.url)
  await page.screenshot(screenshotOption)
  await page.close()
}

module.exports = {
  promiseChain,
  getPostScreenshot,
  getPostUrlMultiPages,
  filterPostWithinTime,
}
