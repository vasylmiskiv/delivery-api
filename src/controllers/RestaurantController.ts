import Category from "../models/Category";
import Restaurant from "../models/Restaurant";
import User from "../models/User";
import { Utils } from "../utils/Utils";

export class RestaurantController {
  static async addRestaurant(req, res, next) {
    const restaurant = req.body;
    const path = req.file.path;
    const verification_token = Utils.generateVerificationToken();

    try {
      // create restaurant user
      const hash = await Utils.encryptPassword(restaurant.password);

      const data = {
        email: restaurant.email,
        verification_token,
        verification_token_time: Date.now() + new Utils().MAX_TOKEN_TIME,
        phone: restaurant.phone,
        password: hash,
        name: restaurant.name,
        type: "restaurant",
        status: "active",
      };

      const user = await new User(data).save();

      // create restaurant
      let restaurant_data: any = {
        name: restaurant.res_name,
        // short_name: restaurant.short_name,
        location: JSON.parse(restaurant.location),
        address: restaurant.address,
        openTime: restaurant.openTime,
        closeTime: restaurant.closeTime,
        status: restaurant.status,
        cuisines: JSON.parse(restaurant.cuisines),
        price: parseInt(restaurant.price),
        delivery_time: parseInt(restaurant.delivery_time),
        city_id: restaurant.city_id,
        user_id: user._id,
        cover: path,
      };

      if (restaurant.description)
        restaurant_data = {
          ...restaurant_data,
          description: restaurant.description,
        };

      const restaurantDoc = await new Restaurant(restaurant_data).save();

      // create categories
      const categoriesData = JSON.parse(restaurant.categories).map((x) => {
        return { name: x, restaurant_id: restaurantDoc._id };
      });
      const categories = Category.insertMany(categoriesData);

      res.send(restaurantDoc);

      // send mail to restaurant user for verification
      // await NodeMailer.sendMail({
      //     to: [user.email],
      //     subject: 'Email Verification',
      //     html: `<h1>Your Otp is ${verification_token}</h1>`
      // });
    } catch (e) {
      next(e);
    }
  }

  static async getNearbyRestaurants(req, res, next) {
    // const METERS_PER_MILE = 1609.34;
    const METERS_PER_KM = 1000;
    // const EARTH_RADIUS_IN_MILE = 3963.2;
    const EARTH_RADIUS_IN_KM = 6378.1;
    const data = req.query;
    const perPage = 10;
    const currentPage = parseInt(data.page) || 1;
    const prevPage = currentPage == 1 ? null : currentPage - 1;
    let nextPage = currentPage + 1;

    try {
      const restaurants_doc_count = await Restaurant.countDocuments({
        location: {
          $geoWithin: {
            $centerSphere: [
              [parseFloat(data.lng), parseFloat(data.lat)],
              parseFloat(data.radius) / EARTH_RADIUS_IN_KM,
            ],
          },
        },
        status: "active",
      });

      // send empty array if no document on filterquery exists
      if (!restaurants_doc_count) {
        res.json({
          restaurants: [],
          perPage,
          currentPage,
          prevPage,
          nextPage: null,
          totalPages: 0,
          // totalRecords: restaurants_doc_count
        });
      }

      // let restaurants_doc_count: any = await Restaurant.aggregate([
      //     {
      //         $geoNear: {
      //             near:
      //             {
      //                 type: "Point",
      //                 coordinates: [ parseFloat(data.lng), parseFloat(data.lat) ]
      //             },
      //             maxDistance: parseFloat(data.radius) * METERS_PER_KM,
      //             query: { status: 'active' },
      //             distanceField: "distance",
      //             spherical: true
      //         }
      //     }
      // ])
      // .count('count');

      // // console.log(restaurants_doc_count);

      // // send empty array if no document on filterquery exists
      // if(!restaurants_doc_count || restaurants_doc_count.length == 0) {
      //     res.json({
      //         restaurants: [],
      //         perPage,
      //         currentPage,
      //         prevPage,
      //         nextPage: null,
      //         totalPages: 0,
      //         // totalRecords: restaurants_doc_count
      //     });
      // }

      // if(restaurants_doc_count instanceof Array) {
      //     restaurants_doc_count = restaurants_doc_count[0].count;
      // }

      const totalPages = Math.ceil(restaurants_doc_count / perPage);
      if (totalPages == 0 || totalPages == currentPage) {
        nextPage = null;
      }
      if (totalPages < currentPage) {
        // throw new Error('No more Orders available');
        throw "No more Restaurants available";
      }
      const restaurants = await Restaurant.find({
        location: {
          $nearSphere: {
            $geometry: {
              type: "Point",
              coordinates: [parseFloat(data.lng), parseFloat(data.lat)],
            },
            $maxDistance: parseFloat(data.radius) * EARTH_RADIUS_IN_KM,
          },
          // $geoWithin: {
          //     $centerSphere: [
          //         [ parseFloat(data.lng), parseFloat(data.lat) ],
          //         parseFloat(data.radius) /  EARTH_RADIUS_IN_KM
          //     ]
          // }
        },
        status: "active",
      })
        .skip(currentPage * perPage - perPage)
        .limit(perPage);
      // .setOptions({ explain: 'executionStats' });

      // const restaurants = await Restaurant.aggregate([
      //     {
      //         $geoNear: {
      //             near:
      //             {
      //                 type: "Point",
      //                 coordinates: [ parseFloat(data.lng), parseFloat(data.lat) ]
      //             },
      //             maxDistance: parseFloat(data.radius) * METERS_PER_KM,
      //             query: { status: 'active' },
      //             distanceField: "distance", // distance in meters
      //             distanceMultiplier: 0.001, // convert in km
      //             spherical: true
      //         }
      //     },
      //     {
      //         $limit: perPage
      //     }
      // ]).skip((currentPage * perPage) - perPage);

      // res.send(restaurants);
      res.json({
        restaurants,
        perPage,
        currentPage,
        prevPage,
        nextPage,
        totalPages,
        // totalRecords: restaurants_doc_count
      });
    } catch (e) {
      next(e);
    }
  }

  static async searchNearbyRestaurants(req, res, next) {
    // const METERS_PER_MILE = 1609.34;
    const METERS_PER_KM = 1000;
    // const EARTH_RADIUS_IN_MILE = 3963.2;
    const EARTH_RADIUS_IN_KM = 6378.1;
    const data = req.query;
    const perPage = 10;
    const currentPage = parseInt(data.page) || 1;
    const prevPage = currentPage == 1 ? null : currentPage - 1;
    let nextPage = currentPage + 1;
    try {
      // const restaurants_doc_count = await Restaurant.estimatedDocumentCount(); // filter not available in this query
      const restaurants_doc_count = await Restaurant.countDocuments({
        location: {
          $geoWithin: {
            $centerSphere: [
              [parseFloat(data.lng), parseFloat(data.lat)],
              parseFloat(data.radius) / EARTH_RADIUS_IN_KM,
            ],
          },
        },
        status: "active",
        // name: { $regex: data.name, $options: '$i'}
        name: { $regex: data.name, $options: "i" },
      });

      // send empty array if no document on filterquery exists
      if (!restaurants_doc_count) {
        res.json({
          restaurants: [],
          perPage,
          currentPage,
          prevPage,
          nextPage: null,
          totalPages: 0,
          // totalRecords: restaurants_doc_count
        });
      }

      // let restaurants_doc_count: any = await Restaurant.aggregate([
      //     {
      //         $geoNear: {
      //             near:
      //             {
      //                 type: "Point",
      //                 coordinates: [ parseFloat(data.lng), parseFloat(data.lat) ]
      //             },
      //             maxDistance: parseFloat(data.radius) * METERS_PER_KM,
      //             query: { status: 'active', name: { $regex: data.name, $options: '$i'} },
      //             distanceField: "distance",
      //             spherical: true
      //         }
      //     }
      // ])
      // .count('count');

      // // console.log(restaurants_doc_count);
      // // send empty array if no document on filterquery exists
      // if(!restaurants_doc_count || restaurants_doc_count.length == 0) {
      //     res.json({
      //         restaurants: [],
      //         perPage,
      //         currentPage,
      //         prevPage,
      //         nextPage: null,
      //         totalPages: 0,
      //         // totalRecords: restaurants_doc_count
      //     });
      // }
      // if(restaurants_doc_count instanceof Array) {
      //     restaurants_doc_count = restaurants_doc_count[0].count;
      // }

      const totalPages = Math.ceil(restaurants_doc_count / perPage);
      if (totalPages == 0 || totalPages == currentPage) {
        nextPage = null;
      }

      if (totalPages < currentPage) {
        // throw new Error('No more Orders available');
        throw "No more Restaurants available";
      }

      const restaurants = await Restaurant.find({
        location: {
          $nearSphere: {
            $geometry: {
              type: "Point",
              coordinates: [parseFloat(data.lng), parseFloat(data.lat)],
            },
            $maxDistance: parseFloat(data.radius) * EARTH_RADIUS_IN_KM,
          },
          // $geoWithin: {
          //     $centerSphere: [
          //         [ parseFloat(data.lng), parseFloat(data.lat) ],
          //         parseFloat(data.radius) /  EARTH_RADIUS_IN_KM
          //     ]
          // }
        },
        status: "active",
        // name: { $regex: data.name, $options: '$i'}
        name: { $regex: data.name, $options: "i" },
      })
        .skip(currentPage * perPage - perPage)
        .limit(perPage);
      // .setOptions({ explain: 'executionStats' });

      // const restaurants = await Restaurant.aggregate([
      //     {
      //         $geoNear: {
      //             near:
      //             {
      //                 type: "Point",
      //                 coordinates: [ parseFloat(data.lng), parseFloat(data.lat) ]
      //             },
      //             maxDistance: parseFloat(data.radius) * METERS_PER_KM,
      //             query: { status: 'active', name: { $regex: data.name, $options: '$i'} },
      //             distanceField: "distance", // distance in meters
      //             distanceMultiplier: 0.001, // convert in km
      //             spherical: true
      //         }
      //     },
      //     {
      //         $limit: perPage
      //     }
      // ]
      // // , { explain: true }
      // ).skip((currentPage * perPage) - perPage);

      // res.send(restaurants);

      res.json({
        restaurants,
        perPage,
        currentPage,
        prevPage,
        nextPage,
        totalPages,
        // totalRecords: restaurants_doc_count
      });
    } catch (e) {
      next(e);
    }
  }

  static async getRestaurants(req, res, next) {
    try {
      const restaurants = await Restaurant.find({
        status: "active",
      });

      res.send(restaurants);
    } catch (e) {
      next(e);
    }
  }
}
