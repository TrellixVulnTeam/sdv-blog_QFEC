import { pbkdf2Sync, randomBytes } from "crypto";
import { Model } from "objection";
import config from "../config.js";
import CommentModel from "./CommentModel.js";
import PostModel from "./PostModel.js";

const {
  security: {
    password: { digest, keylen, iterations, saltSize },
  },
} = config;

class UserModel extends Model {
  static tableName = "users";

  static get relationMappings() {
    return {
      comments: {
        relation: Model.HasManyRelation,
        modelClass: CommentModel,
        join: {
          from: "users.id",
          to: "comments.userId",
        },
      },
      posts: {
        relation: Model.HasManyRelation,
        modelClass: PostModel,
        join: {
          from: "users.id",
          to: "posts.userId",
        },
      },
    };
  }

  static getHashPassword = (
    password,
    salt = randomBytes(saltSize).toString("hex")
  ) => [
    pbkdf2Sync(password, salt, iterations, keylen, digest).toString("hex"),
    salt,
  ];
  checkPassword = (password) => {
    const [hash] = UserModel.getHashPassword(password, this.passwordSalt);

    return hash === this.passwordHash;
  };
}

export default UserModel;
