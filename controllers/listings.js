 const Listing = require("../models/listing");
 const mbxGeocoding = require(`@mapbox/mapbox-sdk/services/geocoding`);
 const mapToken = process.env.MAP_TOKEN;
 const geocodingClint = mbxGeocoding({ accessToken: mapToken });
 
 module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("./listings/index.ejs", {allListings});
  };

  module.exports.renderNewForm = (req, res)=> {
    res.render("./listings/new.ejs");
};

module.exports.showListing = async(req, res) => {
  let {id} = req.params;
  const listing = await Listing.findById(id)
  .populate({ 
    path: "reviews", 
    populate: {
    path: "author",
  },
  })
  .populate("Owner");
  if(!listing) {
    req.flash("success", "Listing Does Not Exist");
    res.redirect("/listing");
  }
  res.render("./listings/show.ejs", {listing});
};

module.exports.createListing =  async (req, res, next) => {
  let responce = await geocodingClint
  .forwardGeocode({
    query: req.body.listing.location,
    limit: 1
    })
    .send();
  console.log(responce.body.features[0]);
  
    let url = req.file.path;
    let filename = req.file.filename;
    let {title,description,location,country,price,image} = req.body.listing;
    image = {
     url: image,
     filename: "",
    };
    const newListing = new Listing({title,description,location,country,price,image});
    newListing.Owner = req.user._id;
    newListing.image = {url, filename};
  
    newListing.geometry = responce.body.features[0].geometry;
  
      const listing =  await newListing.save();
      console.log(listing);
      req.flash("success", "New Listing Created");
        res.redirect("/listings");
     
   };

 module.exports.renderEditFrom = async (req, res) => {
  let {id} = req.params;
  const listing = await Listing.findById(id);
  if(!listing) {
   req.flash("success", "Listing Does Not Exist");
   res.redirect("/listing");
 }
 let originalImageUrl = listing.image.url;
 originalImageUrl =  originalImageUrl.replace("/upload", "/upload/w_250");
  res.render("./listings/edit.ejs", {listing, originalImageUrl});
};

module.exports.updateListing =  async (req, res) => {
  let { id } = req.params;
  const {title,description,location,country,price,image} = req.body.listing
  let listing = await Listing.findByIdAndUpdate(id, {title,description,location,country,price,image:{url:image}});

  if(typeof req.file !== "undefined"){
  let url = req.file.path;
  let filename = req.file.filename;
  listing.image = {url, filename};
  await listing.save();
}
  req.flash("success", "Listing Updated");
  res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  req.flash("success", "Listing Deleted");
  res.redirect("/listings");
};