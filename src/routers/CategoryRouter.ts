import { Router } from "express";
import { CategoryController } from "../controllers/CategoryController";
import { GlobalMiddleWare } from "../middlewares/GlobalMiddleWare";

class CategoryRouter {
  public router: Router;

  constructor() {
    this.router = Router();
    this.getRoutes();
    this.postRoutes();
    this.patchRoutes();
    this.putRoutes();
    this.deleteRoutes();
  }

  getRoutes() {
    this.router.get(
      "/getCategories/:restaurantId",
      GlobalMiddleWare.auth,
      CategoryController.getCategoriesByRestaurant
    );
  }

  postRoutes() {}

  patchRoutes() {}

  putRoutes() {}

  deleteRoutes() {}
}

export default new CategoryRouter().router;
