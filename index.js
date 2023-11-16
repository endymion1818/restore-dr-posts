const { parse } = require('rss-to-json');
const cheerio = require('cheerio');
const fs = require('fs');

const TurndownService = require('turndown')
const turndownService = new TurndownService({
  codeBlockStyle: 'fenced',
  bulletListMarker: '-',
  headingStyle: 'atx',
})

async function parseToMarkdown(data) {
  const htmlToParse = cheerio.load(data)
  const content = htmlToParse('main').html();
  var markdown = turndownService.turndown(content);
  const title = htmlToParse('head title').text();
  const description = htmlToParse('head meta[name="description"]').attr('content');
  const canonical = htmlToParse('head link[rel="canonical"]').attr('href');
  const datePublished = htmlToParse('main time').attr('datetime');
  return `title: "${title}"\ndescription: "${description}"\ncategories:\ndatePublished: ${datePublished}\ncanonicalLink: "${canonical}\n---\n${markdown}"`;
}
(async () => {

    var rss = await parse('https://deliciousreverie.co.uk/rss.xml');

    rss.items.forEach(async item => {
      const results = await fetch(item.id);
      const data = await results.text();
      const url = new URL(item.id);
      const slug = url.pathname.split('/')[2];
      const markdown = await parseToMarkdown(data);
    
      fs.writeFileSync(`./posts/${slug}.md`, markdown);
    });

})();
