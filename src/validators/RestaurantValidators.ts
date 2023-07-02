import { body, query } from "express-validator";
import User from "../models/User";

export class RestaurantValidators {
  static addRestaurant() {
    return [
      body("name", "Owner Name is required").isString(),
      body("email", "Email is required")
        .isEmail()
        .custom((email, { req }) => {
          return User.findOne({
            email: email,
            // type: 'user'
          })
            .then((user) => {
              if (user) {
                // throw new Error('User Already Exists');
                throw "User Already Exists";
              } else {
                return true;
              }
            })
            .catch((e) => {
              throw new Error(e);
            });
        }),
      body("phone", "Phone number is required").isString(),
      body("password", "Password is required")
        .isAlphanumeric()
        .isLength({ min: 8, max: 20 })
        .withMessage("Password must be between 8-20 characters"),

      body("restaurantImages", "Cover image is required").custom(
        (cover, { req }) => {
          if (req.file) {
            return true;
          } else {
            // throw new Error('File not uploaded');
            throw "File not uploaded";
          }
        }
      ),
      body("res_name", "Restaurant Name is required").isString(),
      body("short_name", "Restaurant Short Name is required").isString(),
      body("openTime", "Opening time is required").isString(),
      body("closeTime", "Closing time is required").isString(),
      body("price", "Price is required").isString(),
      body("delivery_time", "Delivery time is required").isString(),
      body("status", "Status is required").isString(),
      body("address", "Address is required").isString(),
      body("location", "Location is required").isString(),
      body("cuisines", "Cuisines is required").isString(),
      body("city_id", "City is required").isString(),
    ];
  }

  static getNearbyRestaurants() {
    return [
      query("lat", "Latitude is required").isNumeric(),
      query("lng", "Longitude is required").isNumeric(),
      query("radius", "Radius is required").isNumeric(),
    ];
  }

  static searchNearbyRestaurants() {
    return [
      query("lat", "Latitude is required").isNumeric(),
      query("lng", "Longitude is required").isNumeric(),
      query("radius", "Radius is required").isNumeric(),
      query("name", "Search query is required").isString(),
    ];
  }
}
