"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  api: () => api
});
module.exports = __toCommonJS(index_exports);
var import_https = require("firebase-functions/v2/https");

// src/core/error/app-error.ts
var AppError = class extends Error {
  message;
  payload;
  statusCode;
  constructor({ message, statusCode, payload = {} }) {
    super();
    this.message = message;
    this.payload = payload;
    this.statusCode = statusCode;
  }
};

// src/infra/http/api-server.ts
var import_express7 = __toESM(require("express"));
var import_express_async_errors = require("express-async-errors");
var import_zod15 = require("zod");
var import_zod_validation_error = require("zod-validation-error");

// src/infra/libs/mongoose/index.ts
var import_node_console = require("console");
var import_mongoose = __toESM(require("mongoose"));
async function loadMongodbConnection() {
  try {
    await import_mongoose.default.connect(
      "mongodb://docker:docker@localhost:27017/event-facil-mongodb",
      {
        minPoolSize: 2,
        maxPoolSize: 10,
        authSource: "admin"
      }
    );
    return import_mongoose.default;
  } catch (error) {
    (0, import_node_console.error)(error);
    throw new Error("Failed to load mongodb!");
  }
}

// src/infra/http/routes/index.ts
var import_express6 = require("express");

// src/env/index.ts
var import_zod = require("zod");
var envSchema = import_zod.z.object({
  MONGODB_URL: import_zod.z.string().default(""),
  JWT_SECRET: import_zod.z.string().default(""),
  FUNCTIONS_EMULATOR: import_zod.z.string().default("")
});
function getEnvVariables() {
  return envSchema.parse(process.env);
}

// src/infra/http/middlewares/verify-auth-and-account.ts
var import_jsonwebtoken = __toESM(require("jsonwebtoken"));
function verifyAuthAndAccount(request, response, next) {
  const env = getEnvVariables();
  const authHeader = request.headers.authorization;
  const accountId = request.headers["x-account-id"];
  if (!authHeader) {
    return response.status(401 /* Unauthorized */).send();
  }
  if (!accountId) {
    return response.status(401 /* Unauthorized */).send();
  }
  const [, token] = authHeader.split(" ");
  try {
    const decoded = import_jsonwebtoken.default.verify(token, env.JWT_SECRET);
    const { sub } = decoded;
    request.user = {
      id: sub,
      accountId
    };
    return next();
  } catch {
    return response.status(401 /* Unauthorized */).json();
  }
}

// src/infra/http/routes/auth-router.ts
var import_express = require("express");

// src/infra/databases/model/mongoose-account-model.ts
var import_mongoose2 = require("mongoose");
var Plan = /* @__PURE__ */ ((Plan2) => {
  Plan2["ESSENTIAL"] = "essential";
  Plan2["CLASSIC"] = "classic";
  Plan2["PREMIUM"] = "premium";
  Plan2["EXCLUSIVE"] = "exclusive";
  return Plan2;
})(Plan || {});
var accountSchema = new import_mongoose2.Schema({
  name: { type: String, required: true },
  plan: { type: String, enum: Object.values(Plan), required: true },
  userId: { type: import_mongoose2.Schema.Types.ObjectId, required: true, ref: "User" },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  deletedAt: {
    type: Date
  }
});
var MongooseAccountModel = (0, import_mongoose2.model)("Account", accountSchema, "accounts");

// src/infra/databases/model/mongoose-user-model.ts
var import_mongoose3 = require("mongoose");
var userSchema = new import_mongoose3.Schema({
  name: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  email: { type: String, required: true },
  passwordHash: { type: String, required: true },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  deletedAt: {
    type: Date
  }
});
var MongooseUserModel = (0, import_mongoose3.model)("User", userSchema, "users");

// src/infra/http/controllers/auth/login-user-controller.ts
var import_bcrypt = __toESM(require("bcrypt"));
var import_jsonwebtoken2 = __toESM(require("jsonwebtoken"));
var import_zod2 = require("zod");
var loginUserBodySchema = import_zod2.z.object({
  email: import_zod2.z.string().email(),
  password: import_zod2.z.string().min(6),
  rememberMe: import_zod2.z.boolean().optional().default(false)
});
var LoginUserController = class {
  static env = getEnvVariables();
  static async handle(request, response) {
    const { email, password, rememberMe } = loginUserBodySchema.parse(
      request.body
    );
    const user = await MongooseUserModel.findOne({ email });
    if (!user) {
      return response.status(400 /* BadRequest */).send({
        message: "Invalid email or password!"
      });
    }
    const passwordMatch = import_bcrypt.default.compareSync(password, user.passwordHash);
    if (!passwordMatch) {
      return response.status(400 /* BadRequest */).send({ message: "Invalid email or password!" });
    }
    const userId = user._id;
    const expiresIn = rememberMe ? "7d" : "1d";
    const token = import_jsonwebtoken2.default.sign({ sub: userId }, this.env.JWT_SECRET, {
      expiresIn
    });
    const accounts = await MongooseAccountModel.find({ userId });
    const accountsPayload = accounts.map((account) => {
      return {
        id: account._id,
        name: account.name,
        plan: account.plan,
        createdAt: account.createdAt
      };
    });
    return response.status(200 /* Ok */).send({
      id: userId,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      token,
      createdAt: user.createdAt,
      accounts: accountsPayload
    });
  }
};

// src/infra/http/controllers/auth/register-user-controller.ts
var import_bcrypt2 = __toESM(require("bcrypt"));
var import_zod3 = require("zod");
var registerUserBodySchema = import_zod3.z.object({
  name: import_zod3.z.string().min(1),
  email: import_zod3.z.string().email(),
  password: import_zod3.z.string().min(6),
  phoneNumber: import_zod3.z.string().min(11).max(11)
});
var RegisterUserController = class {
  static async handle(request, response) {
    const { email, password, phoneNumber, name } = registerUserBodySchema.parse(
      request.body
    );
    const userAlreadyCreated = await MongooseUserModel.findOne({ email });
    if (userAlreadyCreated) {
      return response.status(400 /* BadRequest */).json({ message: "User already created" });
    }
    const hashedPassword = import_bcrypt2.default.hashSync(password, 10);
    const userCreated = await MongooseUserModel.create({
      name,
      phoneNumber,
      email,
      passwordHash: hashedPassword
    });
    await MongooseAccountModel.create({
      name,
      plan: "essential" /* ESSENTIAL */,
      userId: userCreated._id
    });
    return response.status(201 /* Created */).send();
  }
};

// src/infra/http/routes/auth-router.ts
var authRouter = (0, import_express.Router)();
authRouter.post(
  "/register",
  (request, response) => RegisterUserController.handle(request, response)
);
authRouter.post(
  "/login",
  (request, response) => LoginUserController.handle(request, response)
);

// src/infra/http/routes/suppliers-router.ts
var import_express2 = require("express");

// src/infra/databases/model/mongoose-supplier-model.ts
var import_mongoose4 = require("mongoose");
var costSchema = new import_mongoose4.Schema(
  {
    type: { type: String, required: true },
    value: { type: Number, required: true }
  },
  { _id: false }
);
var supplierSchema = new import_mongoose4.Schema({
  name: { type: String, required: true },
  costs: [costSchema],
  accountId: { type: import_mongoose4.Schema.Types.ObjectId, required: true, ref: "Account" },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  deletedAt: {
    type: Date
  }
});
var MongooseSupplierModel = (0, import_mongoose4.model)(
  "Supplier",
  supplierSchema,
  "suppliers"
);

// src/infra/http/controllers/suppliers/create-supplier-controller.ts
var import_zod4 = require("zod");
var createSupplierBodySchema = import_zod4.z.object({
  name: import_zod4.z.string().min(1),
  costs: import_zod4.z.array(
    import_zod4.z.object({
      type: import_zod4.z.string().min(1),
      value: import_zod4.z.number().min(0)
    })
  )
});
var CreateSupplierController = class {
  static async handle(request, response) {
    const { id: userId, accountId } = request.user;
    const { costs, name } = createSupplierBodySchema.parse(request.body);
    const user = await MongooseUserModel.findById(userId);
    if (!user) {
      return response.status(404 /* NotFound */).send();
    }
    const accountAlreadyExists = await MongooseAccountModel.findById(accountId);
    if (!accountAlreadyExists) {
      return response.status(404 /* NotFound */).send();
    }
    await MongooseSupplierModel.create({
      accountId,
      name,
      costs
    });
    return response.status(201 /* Created */).send();
  }
};

// src/infra/http/controllers/suppliers/delete-supplier-controller.ts
var import_zod5 = require("zod");
var deleteSupplierParamsSchema = import_zod5.z.object({
  supplierId: import_zod5.z.string().min(1)
});
var DeleteSupplierController = class {
  static async handle(request, response) {
    const { accountId } = request.user;
    const { supplierId } = deleteSupplierParamsSchema.parse(request.params);
    await MongooseSupplierModel.deleteOne({ _id: supplierId, accountId });
    return response.status(204 /* NoContent */).send();
  }
};

// src/infra/http/controllers/suppliers/fetch-by-id-supplier-controller.ts
var import_zod6 = require("zod");
var fetchbyidSupplierParamsSchema = import_zod6.z.object({
  supplierId: import_zod6.z.string().min(1)
});
var FetchByIdSupplierController = class {
  static async handle(request, response) {
    const { supplierId } = fetchbyidSupplierParamsSchema.parse(request.params);
    const supplier = await MongooseSupplierModel.findById(supplierId);
    if (!supplier) {
      return response.status(400 /* BadRequest */).send();
    }
    const suppliersSerialized = {
      id: supplier._id,
      name: supplier.name,
      costs: supplier.costs.map((cost) => ({
        type: cost.type,
        value: cost.value
      })),
      createdAt: supplier.createdAt,
      updatedAt: supplier.updatedAt
    };
    return response.status(200 /* Ok */).send(suppliersSerialized);
  }
};

// src/infra/http/controllers/suppliers/fetch-many-supplier-controller.ts
var import_zod7 = require("zod");
var fetchManySupplierQuerySchema = import_zod7.z.object({
  query: import_zod7.z.string().optional(),
  limit: import_zod7.z.coerce.number({ message: "Limit must be a number" }).default(30),
  page: import_zod7.z.coerce.number({ message: "Page must be a number" }).default(1)
});
var FetchManySupplierController = class {
  static async handle(request, response) {
    const { accountId } = request.user;
    const { limit, page, query } = fetchManySupplierQuerySchema.parse(
      request.query
    );
    const suppliers = await MongooseSupplierModel.find({
      accountId,
      ...query && {
        $or: [{ name: { $regex: query, $options: "i" } }]
      }
    }).limit(limit).skip((page - 1) * limit);
    const suppliersCount = await MongooseSupplierModel.countDocuments({
      accountId
    });
    const suppliersSerialized = suppliers.map((supplier) => ({
      id: supplier._id,
      name: supplier.name,
      costs: supplier.costs.map((cost) => ({
        type: cost.type,
        value: cost.value
      })),
      createdAt: supplier.createdAt,
      updatedAt: supplier.updatedAt
    }));
    const totalPages = Math.ceil(suppliersCount / limit);
    return response.status(200 /* Ok */).json({
      data: suppliersSerialized,
      meta: {
        page,
        limit,
        total: suppliersCount,
        totalPages
      }
    });
  }
};

// src/infra/http/controllers/suppliers/update-supplier-controller.ts
var import_zod8 = require("zod");
var updateSupplierParamsSchema = import_zod8.z.object({
  name: import_zod8.z.string(),
  costs: import_zod8.z.array(
    import_zod8.z.object({
      type: import_zod8.z.string(),
      value: import_zod8.z.number()
    })
  )
});
var UpdateSupplierController = class {
  static async handle(request, response) {
    const { accountId } = request.user;
    const { supplierId } = request.params;
    const { costs, name } = updateSupplierParamsSchema.parse(request.body);
    const supplier = await MongooseSupplierModel.findOne({
      _id: supplierId,
      accountId
    });
    if (!supplier) {
      return response.status(404 /* NotFound */).send();
    }
    await MongooseSupplierModel.updateOne(
      { _id: supplierId },
      {
        $set: {
          name,
          costs
        }
      }
    );
    return response.status(204 /* NoContent */).send();
  }
};

// src/infra/http/routes/suppliers-router.ts
var suppliersRouter = (0, import_express2.Router)();
suppliersRouter.post(
  "/suppliers",
  (request, response) => CreateSupplierController.handle(request, response)
);
suppliersRouter.put(
  "/suppliers/:supplierId",
  (request, response) => UpdateSupplierController.handle(request, response)
);
suppliersRouter.delete(
  "/suppliers/:supplierId",
  (request, response) => DeleteSupplierController.handle(request, response)
);
suppliersRouter.get(
  "/suppliers",
  (request, response) => FetchManySupplierController.handle(request, response)
);
suppliersRouter.get(
  "/suppliers/:supplierId",
  (request, response) => FetchByIdSupplierController.handle(request, response)
);

// src/infra/http/routes/events-router.ts
var import_express3 = require("express");

// src/infra/databases/model/mongoose-event-model.ts
var import_mongoose5 = require("mongoose");
var supplierSchema2 = new import_mongoose5.Schema(
  {
    name: { type: String, required: true },
    type: { type: String, required: true },
    value: { type: Number, required: true },
    quantity: { type: Number, required: true }
  },
  { _id: false }
);
var eventSchema = new import_mongoose5.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  income: { type: Number, required: true },
  expense: { type: Number, required: true },
  shouldNotifyWhatsappWhenNear: { type: Boolean, required: true },
  dateTime: {
    type: Date,
    required: true
  },
  suppliers: { type: [supplierSchema2], required: true },
  accountId: { type: import_mongoose5.Schema.Types.ObjectId, required: true, ref: "Account" },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  deletedAt: {
    type: Date
  }
});
var MongooseEventModel = (0, import_mongoose5.model)("Event", eventSchema, "events");

// src/infra/http/controllers/events/create-event-controller.ts
var import_zod9 = require("zod");
var createEventBodySchema = import_zod9.z.object({
  name: import_zod9.z.string().min(1),
  dateTime: import_zod9.z.coerce.date(),
  address: import_zod9.z.string().min(1),
  shouldNotifyWhatsappWhenNear: import_zod9.z.boolean(),
  income: import_zod9.z.number().min(1),
  expense: import_zod9.z.number().min(1),
  suppliers: import_zod9.z.array(
    import_zod9.z.object({
      name: import_zod9.z.string().min(1),
      type: import_zod9.z.string().min(1),
      value: import_zod9.z.number().min(1),
      quantity: import_zod9.z.number().min(1)
    })
  )
});
var CreateEventController = class {
  static async handle(request, response) {
    const { id: userId, accountId } = request.user;
    const {
      name,
      dateTime,
      address,
      shouldNotifyWhatsappWhenNear,
      income,
      expense,
      suppliers
    } = createEventBodySchema.parse(request.body);
    const user = await MongooseUserModel.findById(userId);
    if (!user) {
      return response.status(404 /* NotFound */).send();
    }
    const accountAlreadyExists = await MongooseAccountModel.findById(accountId);
    if (!accountAlreadyExists) {
      return response.status(404 /* NotFound */).send();
    }
    await MongooseEventModel.create({
      name,
      dateTime: dateTime.getTime(),
      address,
      shouldNotifyWhatsappWhenNear,
      income,
      expense,
      suppliers,
      accountId
    });
    return response.status(201 /* Created */).send();
  }
};

// src/infra/http/controllers/events/fetch-many-event-controller.ts
var import_zod10 = require("zod");
var fetchManyEventQuerySchema = import_zod10.z.object({
  query: import_zod10.z.string().optional(),
  limit: import_zod10.z.coerce.number({ message: "Limit must be a number" }).default(30),
  page: import_zod10.z.coerce.number({ message: "Page must be a number" }).default(1)
});
var FetchManyEventController = class {
  static async handle(request, response) {
    const { accountId } = request.user;
    const { limit, page, query } = fetchManyEventQuerySchema.parse(
      request.query
    );
    const events = await MongooseEventModel.find({
      accountId,
      ...query && {
        $or: [{ name: { $regex: query, $options: "i" } }]
      }
    }).limit(limit).skip((page - 1) * limit);
    const eventsCount = await MongooseEventModel.countDocuments({
      accountId
    });
    const eventsSerialized = events.map((event) => ({
      id: event._id,
      name: event.name,
      dateTime: event.dateTime,
      address: event.address,
      shouldNotifyWhatsappWhenNear: event.shouldNotifyWhatsappWhenNear,
      income: event.income,
      expense: event.expense,
      suppliers: event.suppliers,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt
    }));
    const totalPages = Math.ceil(eventsCount / limit);
    return response.status(200 /* Ok */).json({
      data: eventsSerialized,
      meta: {
        page,
        limit,
        total: eventsCount,
        totalPages
      }
    });
  }
};

// src/infra/http/controllers/events/delete-event-controller.ts
var import_zod11 = require("zod");
var deleteEventParamsSchema = import_zod11.z.object({
  eventId: import_zod11.z.string().min(1)
});
var DeleteEventController = class {
  static async handle(request, response) {
    const { accountId } = request.user;
    const { eventId } = deleteEventParamsSchema.parse(request.params);
    await MongooseEventModel.deleteOne({ _id: eventId, accountId });
    return response.status(204 /* NoContent */).send();
  }
};

// src/infra/http/controllers/events/fetch-by-id-event-controller.ts
var import_zod12 = require("zod");
var fetchbyidEventParamsSchema = import_zod12.z.object({
  eventId: import_zod12.z.string().min(1)
});
var FetchByIdEventController = class {
  static async handle(request, response) {
    const { eventId } = fetchbyidEventParamsSchema.parse(request.params);
    const event = await MongooseEventModel.findById(eventId);
    if (!event) {
      return response.status(400 /* BadRequest */).send();
    }
    const eventsSerialized = {
      id: event._id,
      name: event.name,
      dateTime: event.dateTime,
      address: event.address,
      shouldNotifyWhatsappWhenNear: event.shouldNotifyWhatsappWhenNear,
      suppliers: event.suppliers.map((supplier) => ({
        name: supplier.name,
        type: supplier.type,
        value: supplier.value,
        quantity: supplier.quantity
      })),
      income: event.income,
      expense: event.expense,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt
    };
    return response.status(200 /* Ok */).send(eventsSerialized);
  }
};

// src/infra/http/controllers/events/update-event-controller.ts
var import_zod13 = require("zod");
var updateEventBodySchema = import_zod13.z.object({
  name: import_zod13.z.string().min(1),
  dateTime: import_zod13.z.coerce.date(),
  address: import_zod13.z.string().min(1),
  shouldNotifyWhatsappWhenNear: import_zod13.z.boolean(),
  income: import_zod13.z.number().min(1),
  expense: import_zod13.z.number().min(1),
  suppliers: import_zod13.z.array(
    import_zod13.z.object({
      name: import_zod13.z.string().min(1),
      type: import_zod13.z.string().min(1),
      value: import_zod13.z.number().min(1),
      quantity: import_zod13.z.number().min(1)
    })
  )
});
var UpdateEventController = class {
  static async handle(request, response) {
    const { id: userId, accountId } = request.user;
    const { eventId } = request.params;
    const {
      name,
      dateTime,
      address,
      shouldNotifyWhatsappWhenNear,
      income,
      expense,
      suppliers
    } = updateEventBodySchema.parse(request.body);
    const user = await MongooseUserModel.findById(userId);
    if (!user) {
      return response.status(404 /* NotFound */).send();
    }
    const accountAlreadyExists = await MongooseAccountModel.findById(accountId);
    if (!accountAlreadyExists) {
      return response.status(404 /* NotFound */).send();
    }
    await MongooseEventModel.updateOne(
      {
        _id: eventId
      },
      {
        $set: {
          name,
          dateTime,
          address,
          shouldNotifyWhatsappWhenNear,
          income,
          expense,
          suppliers,
          accountId
        }
      }
    );
    return response.status(200 /* Ok */).send();
  }
};

// src/infra/http/routes/events-router.ts
var eventsRouter = (0, import_express3.Router)();
eventsRouter.post("/events", (request, response) => CreateEventController.handle(request, response));
eventsRouter.get("/events", (request, response) => FetchManyEventController.handle(request, response));
eventsRouter.get(
  "/events/:eventId",
  (request, response) => FetchByIdEventController.handle(request, response)
);
eventsRouter.put("/events/:eventId", (request, response) => UpdateEventController.handle(request, response));
eventsRouter.delete(
  "/events/:eventId",
  (request, response) => DeleteEventController.handle(request, response)
);

// src/infra/http/routes/dashboard-router.ts
var import_express4 = require("express");

// src/infra/http/controllers/dashboard/dashboard-controller.ts
var import_date_fns = require("date-fns");
var DashboardController = class {
  static monthNames = [
    "Jan",
    "Fev",
    "Mar",
    "Abr",
    "Mai",
    "Jun",
    "Jul",
    "Ago",
    "Set",
    "Out",
    "Nov",
    "Dez"
  ];
  static async handle(_request, response) {
    const now = /* @__PURE__ */ new Date();
    const monthlyEvents = await MongooseEventModel.find({
      dateTime: {
        $gte: (0, import_date_fns.startOfMonth)(now),
        $lte: (0, import_date_fns.endOfMonth)(now)
      }
    }).exec();
    const annualEvents = await MongooseEventModel.find({
      dateTime: {
        $gte: (0, import_date_fns.startOfYear)(now),
        $lte: (0, import_date_fns.endOfYear)(now)
      }
    }).exec();
    const eventsMonthlyDivided = annualEvents.reduce((acc, event) => {
      const month = this.getMonthName(event.dateTime);
      if (!acc[month]) {
        acc[month] = { income: 0, expense: 0 };
      }
      acc[month].income += event.income;
      acc[month].expense += event.expense;
      return acc;
    }, {});
    for (const month of this.monthNames) {
      if (!eventsMonthlyDivided[month]) {
        eventsMonthlyDivided[month] = { income: 0, expense: 0 };
        continue;
      }
      eventsMonthlyDivided[month].income = Number(
        eventsMonthlyDivided[month].income.toFixed(2)
      );
      eventsMonthlyDivided[month].expense = Number(
        eventsMonthlyDivided[month].expense.toFixed(2)
      );
    }
    const incomePerMonth = monthlyEvents.reduce((acc, event) => {
      return Number((acc + event.income).toFixed(2));
    }, 0);
    const expensePerMonth = monthlyEvents.reduce((acc, event) => {
      return Number((acc + event.expense).toFixed(2));
    }, 0);
    const profitPerMonth = Number(
      (incomePerMonth - expensePerMonth).toFixed(2)
    );
    const totalPerMonth = monthlyEvents.length;
    return response.status(200 /* Ok */).send({
      monthlyEvents: eventsMonthlyDivided,
      incomePerMonth,
      expensePerMonth,
      totalPerMonth,
      profitPerMonth
    });
  }
  static getMonthName(date) {
    const month = date.toLocaleString("pt-BR", { month: "short" });
    return this.capitalizeFirstLetter(month.replace(".", ""));
  }
  static capitalizeFirstLetter(input) {
    if (!input) return input;
    return input.charAt(0).toUpperCase() + input.slice(1);
  }
};

// src/infra/http/routes/dashboard-router.ts
var dashboardRouter = (0, import_express4.Router)();
dashboardRouter.get(
  "/dashboard",
  (request, response) => DashboardController.handle(request, response)
);

// src/infra/http/routes/calendar-router.ts
var import_express5 = require("express");

// src/infra/http/controllers/calendar/calendar-controller.ts
var import_zod14 = require("zod");
var calendarQuerySchema = import_zod14.z.object({
  fromDate: import_zod14.z.coerce.date(),
  toDate: import_zod14.z.coerce.date()
});
var CalendarController = class {
  static async handle(request, response) {
    console.log(
      "[CalendarController] Handling request to list events for user",
      request.query
    );
    const { accountId } = request.user;
    const { fromDate, toDate } = calendarQuerySchema.parse(request.query);
    const events = await MongooseEventModel.find({
      accountId,
      dateTime: {
        $gte: fromDate,
        $lte: toDate
      }
    });
    const eventsSerialized = events.map((event) => ({
      id: event._id,
      name: event.name,
      dateTime: event.dateTime,
      address: event.address,
      shouldNotifyWhatsappWhenNear: event.shouldNotifyWhatsappWhenNear,
      income: event.income,
      expense: event.expense,
      suppliers: event.suppliers,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt
    }));
    return response.status(200 /* Ok */).json(eventsSerialized);
  }
};

// src/infra/http/routes/calendar-router.ts
var calendarRouter = (0, import_express5.Router)();
calendarRouter.get(
  "/calendar",
  (request, response) => CalendarController.handle(request, response)
);

// src/infra/http/routes/index.ts
var routes = (0, import_express6.Router)();
routes.use(authRouter);
routes.use(verifyAuthAndAccount);
routes.use(suppliersRouter);
routes.use(eventsRouter);
routes.use(dashboardRouter);
routes.use(calendarRouter);
var routes_default = routes;

// src/infra/http/api-server.ts
function getApiServerConfiguration() {
  const app = (0, import_express7.default)();
  app.use(import_express7.default.json());
  app.use(import_express7.default.urlencoded({ extended: true }));
  app.use(routes_default);
  loadMongodbConnection();
  app.use(
    (error, _request, response, _next) => {
      if (error instanceof import_zod15.ZodError) {
        const validationErrors = (0, import_zod_validation_error.fromZodError)(error);
        const issues = validationErrors.details.map((detail) => {
          return {
            property: detail.path,
            message: detail.message
          };
        });
        return response.status(409 /* Conflict */).send({
          message: "Validation Error",
          issues
        });
      }
      if (error instanceof AppError) {
        const { message, payload, statusCode } = error;
        return response.status(statusCode).json({
          errors: {
            message
          }
        });
      }
      console.error(error);
      return response.status(500 /* InternalServerError */).json({
        message: "Internal server error"
      });
    }
  );
  return app;
}

// src/index.ts
var api = (0, import_https.onRequest)(getApiServerConfiguration());
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  api
});
//# sourceMappingURL=index.js.map