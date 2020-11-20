const scrape = require("aliexpress-product-scraper");
const XLSX = require("xlsx");

var productIdList = process.argv.slice(2);
console.log('Connecting to aliexpress...')
console.log('Getting reviews for ' + productIdList);
const productScrapes = productIdList.map((productId) => {
  return scrape(productId);
});
const transformFeedback = (feedback) => {
  return {
    name: feedback.displayName,
    ratings: feedback.rating,
    country: feedback.country,
    review: feedback.content.replace("\n", ". "),
  };
};
Promise.all(productScrapes).then((allProducts) => {
  const reviews = allProducts
    .reduce((acc, product) => {
      return [...acc, ...product.feedback];
    }, [])
    .map(transformFeedback);
  console.log('Received reviews...')
  const ws = XLSX.utils.json_to_sheet(reviews, {
    header: ["name", "ratings", "country", "review"],
  });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "reviews");
  console.log('Saving to file...')
  XLSX.writeFile(wb, "result.xlsx");
  console.log('Finish script! ~~ See result.xlsx for the reviews ~~')
});
