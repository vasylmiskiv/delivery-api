import Category from "../models/Category";
import Item from "../models/Item";

export class ItemController {
  static async addItem(req, res, next) {
    const itemData = req.body;
    const path = req.file.path;

    try {
      // create item
      let item_data: any = {
        name: itemData.name,
        status: itemData.status,
        price: parseInt(itemData.price),
        veg: itemData.veg,
        category_id: itemData.category_id,
        restaurant_id: itemData.restaurant_id,
        cover: path,
      };

      if (itemData.description)
        item_data = { ...item_data, description: itemData.description };

      const itemDoc = await new Item(item_data).save();

      res.send(itemDoc);
    } catch (e) {
      next(e);
    }
  }

  static async getMenu(req, res, next) {
    const restaurant = req.restaurant;

    try {
      const categories = await Category.find(
        { restaurant_id: restaurant._id },
        { __v: 0 }
      );

      const items = await Item.find({
        // status: true,
        restaurant_id: restaurant._id,
      });

      res.json({
        restaurant,
        categories,
        items,
      });
    } catch (e) {
      next(e);
    }
  }
}
