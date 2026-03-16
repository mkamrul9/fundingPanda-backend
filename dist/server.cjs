"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
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

// src/app.ts
var import_express7 = __toESM(require("express"), 1);
var import_cors = __toESM(require("cors"), 1);
var import_helmet = __toESM(require("helmet"), 1);

// src/routes/index.ts
var import_express6 = require("express");

// src/modules/user/user.route.ts
var import_express = require("express");

// src/shared/catchAsync.ts
var catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => next(err));
  };
};
var catchAsync_default = catchAsync;

// src/shared/sendResponse.ts
var sendResponse = (res, data) => {
  res.status(data.statusCode).json({
    success: data.success,
    message: data.message,
    data: data.data,
    meta: data.meta
  });
};
var sendResponse_default = sendResponse;

// src/lib/prisma.ts
var import_client = require("@prisma/client");
var import_pg = require("pg");
var import_adapter_pg = require("@prisma/adapter-pg");
var import_config = require("dotenv/config");
var connectionString = process.env.DATABASE_URL;
var pool = new import_pg.Pool({ connectionString });
var adapter = new import_adapter_pg.PrismaPg(pool);
var prisma = new import_client.PrismaClient({ adapter });
var prisma_default = prisma;

// src/errors/AppError.ts
var AppError = class extends Error {
  constructor(statusCode, message, stack = "") {
    super(message);
    this.statusCode = statusCode;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
};
var AppError_default = AppError;

// src/modules/user/user.service.ts
var getAllUsersFromDB = async () => {
  return await prisma_default.user.findMany();
};
var getMyProfileFromDB = async (userId) => {
  const user = await prisma_default.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isVerified: true,
      university: true,
      bio: true,
      createdAt: true
      // Do NOT select the password hash!
    }
  });
  if (!user) throw new AppError_default(404, "User not found");
  return user;
};
var updateMyProfileInDB = async (userId, payload) => {
  return await prisma_default.user.update({
    where: { id: userId },
    data: payload,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      university: true,
      bio: true
    }
  });
};
var UserService = {
  getAllUsersFromDB,
  getMyProfileFromDB,
  updateMyProfileInDB
};

// src/modules/user/user.controller.ts
var getAllUsers = catchAsync_default(async (req, res) => {
  const result = await UserService.getAllUsersFromDB();
  sendResponse_default(res, {
    statusCode: 200,
    success: true,
    message: "Users retrieved successfully",
    data: result
  });
});
var getMyProfile = catchAsync_default(async (req, res) => {
  const userId = req.user?.id;
  const result = await UserService.getMyProfileFromDB(userId);
  sendResponse_default(res, { statusCode: 200, success: true, message: "Profile retrieved successfully", data: result });
});
var updateMyProfile = catchAsync_default(async (req, res) => {
  const userId = req.user?.id;
  const result = await UserService.updateMyProfileInDB(userId, req.body);
  sendResponse_default(res, { statusCode: 200, success: true, message: "Profile updated successfully", data: result });
});
var UserController = {
  getAllUsers,
  getMyProfile,
  updateMyProfile
};

// src/lib/auth.ts
var import_better_auth = require("better-auth");
var import_prisma2 = require("better-auth/adapters/prisma");
var import_plugins = require("better-auth/plugins");
var import_client2 = require("@prisma/client");

// src/utils/email.ts
var import_nodemailer = __toESM(require("nodemailer"), 1);
var sendEmail = async (options) => {
  const transporter = import_nodemailer.default.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_PORT === "465",
    // true for 465, false for 587/25
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
  let htmlContent = "";
  if (options.templateName === "otp") {
    htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaec; border-radius: 8px;">
          <h2 style="color: #333;">Hello ${options.templateData.name},</h2>
          <p style="color: #555; font-size: 16px;">Your One-Time Password (OTP) for FundingPanda is:</p>
          <div style="background-color: #f4f4f4; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
              <h1 style="color: #4CAF50; letter-spacing: 8px; margin: 0;">${options.templateData.otp}</h1>
          </div>
          <p style="color: #777; font-size: 14px;">This code is valid for 2 minutes. Please do not share it with anyone.</p>
          <hr style="border: none; border-top: 1px solid #eaeaea; margin-top: 30px;" />
          <p style="color: #999; font-size: 12px; text-align: center;">\xA9 2026 FundingPanda Inc.</p>
      </div>
    `;
  }
  if (options.templateName === "verification") {
    const url = options.templateData.url || "#";
    htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaec; border-radius: 8px;">
          <h2 style="color: #333;">Hello ${options.templateData.name},</h2>
          <p style="color: #555; font-size: 16px;">Click the button below to verify your email for FundingPanda:</p>
          <div style="text-align:center; margin: 20px 0;">
              <a href="${url}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Verify Email</a>
          </div>
          <p style="color: #777; font-size: 14px;">If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="color: #777; font-size: 12px; word-break:break-all;">${url}</p>
          <hr style="border: none; border-top: 1px solid #eaeaea; margin-top: 30px;" />
          <p style="color: #999; font-size: 12px; text-align: center;">\xA9 2026 FundingPanda Inc.</p>
      </div>
    `;
  }
  if (options.templateName === "reset-password") {
    const url = options.templateData.url || "#";
    htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaec; border-radius: 8px;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p style="color: #555; font-size: 16px;">Hello,</p>
          <p style="color: #555; font-size: 16px;">We received a request to reset your password for FundingPanda. Click the button below to choose a new password:</p>
          <div style="text-align:center; margin: 30px 0;">
              <a href="${url}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Reset Password</a>
          </div>
          <p style="color: #777; font-size: 14px;">If you did not request this, please ignore this email. This link will expire shortly.</p>
          <hr style="border: none; border-top: 1px solid #eaeaea; margin-top: 30px;" />
          <p style="color: #999; font-size: 12px; text-align: center;">\xA9 2026 FundingPanda Inc.</p>
      </div>
    `;
  }
  const mailOptions = {
    from: process.env.FROM_EMAIL,
    to: options.to,
    subject: options.subject,
    html: htmlContent
  };
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${options.to} [Message ID: ${info.messageId}]`);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

// src/lib/auth.ts
var auth = (0, import_better_auth.betterAuth)({
  // Public URL used by BetterAuth for callbacks/redirects and origin validation
  baseURL: process.env.BETTER_AUTH_URL || `http://localhost:${process.env.PORT || 5e3}`,
  database: (0, import_prisma2.prismaAdapter)(prisma_default, {
    provider: "postgresql"
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    async sendResetPassword(data, request) {
      await sendEmail({
        to: data.user.email,
        subject: "Reset your FundingPanda Password",
        templateName: "reset-password",
        templateData: {
          url: data.url
          // BetterAuth generates this secure, single-use URL automatically!
        }
      });
    }
  },
  // Email verification hook used by BetterAuth for email/password flows
  emailVerification: {
    async sendVerificationEmail({ user, url, token }, req) {
      const nameFallback = user?.name || user.email.split("@")[0];
      await sendEmail({
        to: user.email,
        subject: "Verify your email for FundingPanda",
        templateName: "verification",
        templateData: {
          name: nameFallback,
          url,
          token
        }
      });
    },
    sendOnSignUp: true
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: import_client2.UserRole.STUDENT
      },
      university: {
        type: "string",
        required: false
      },
      bio: {
        type: "string",
        required: false
      },
      isVerified: {
        type: "boolean",
        required: false,
        defaultValue: false
      }
    }
  },
  plugins: [
    (0, import_plugins.bearer)(),
    // Add the emailOTP plugin here
    (0, import_plugins.emailOTP)({
      async sendVerificationOTP(data, ctx) {
        const { email, otp, type } = data || {};
        if (type === "email-verification") {
          let user;
          try {
            user = await ctx?.context?.internalAdapter?.findUserByEmail?.(email);
          } catch (e) {
            user = void 0;
          }
          const nameFallback = user?.name || (email ? email.split("@")[0] : "");
          await sendEmail({
            to: email,
            subject: "Verify your email for FundingPanda",
            templateName: "otp",
            templateData: {
              name: nameFallback,
              otp
            }
          });
        }
      },
      expiresIn: 2 * 60,
      // OTP expires in 2 minutes
      otpLength: 6
    })
  ],
  advanced: {
    useSecureCookies: false
  },
  // Allow the frontend origin and server base URL for BetterAuth origin checks
  // Include both FRONTEND_URL and BETTER_AUTH_URL (or derived baseURL)
  allowedOrigins: [
    process.env.FRONTEND_URL || "http://localhost:3000",
    process.env.BETTER_AUTH_URL || `http://localhost:${process.env.PORT || 5e3}`
  ]
});

// src/middlewares/checkAuth.ts
var checkAuth = (...requiredRoles) => {
  return catchAsync_default(async (req, res, next) => {
    const headersInit = {};
    for (const [key, value] of Object.entries(req.headers)) {
      if (typeof value === "string") headersInit[key] = value;
      else if (Array.isArray(value)) headersInit[key] = value.join(",");
      else if (value !== void 0) headersInit[key] = String(value);
    }
    const session = await auth.api.getSession({
      headers: headersInit
    });
    if (!session || !session.user) {
      return res.status(401).json({
        success: false,
        message: "You are not authorized to access this route."
      });
    }
    if (requiredRoles.length && !requiredRoles.includes(session.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You do not have the required permissions."
      });
    }
    req.user = session.user;
    next();
  });
};
var checkAuth_default = checkAuth;

// src/modules/user/user.route.ts
var import_client3 = require("@prisma/client");
var router = (0, import_express.Router)();
router.get("/", checkAuth_default(import_client3.UserRole.ADMIN), UserController.getAllUsers);
router.get(
  "/me",
  checkAuth_default(import_client3.UserRole.STUDENT, import_client3.UserRole.SPONSOR, import_client3.UserRole.ADMIN),
  // Anyone logged in can view their profile
  UserController.getMyProfile
);
router.patch(
  "/me",
  checkAuth_default(import_client3.UserRole.STUDENT, import_client3.UserRole.SPONSOR, import_client3.UserRole.ADMIN),
  UserController.updateMyProfile
);
var UserRoutes = router;

// src/modules/project/project.route.js
var import_express2 = require("express");

// src/utils/QueryBuilder.ts
var QueryBuilder = class {
  constructor(model, queryParams, config = {}) {
    this.model = model;
    this.queryParams = queryParams;
    this.config = config;
    this.page = 1;
    this.limit = 10;
    this.skip = 0;
    this.sortBy = "createdAt";
    this.sortOrder = "desc";
    this.query = {
      where: {},
      include: {},
      orderBy: {},
      skip: 0,
      take: 10
    };
    this.countQuery = {
      where: {}
    };
  }
  search() {
    const { searchTerm } = this.queryParams;
    const { searchableFields } = this.config;
    if (searchTerm && searchableFields && searchableFields.length > 0) {
      const searchConditions = searchableFields.map(
        (field) => {
          if (field.includes(".")) {
            const parts = field.split(".");
            if (parts.length === 2) {
              const [relation, nestedField] = parts;
              const stringFilter2 = {
                contains: searchTerm,
                mode: "insensitive"
              };
              return {
                [relation]: {
                  [nestedField]: stringFilter2
                }
              };
            } else if (parts.length === 3) {
              const [relation, nestedRelation, nestedField] = parts;
              const stringFilter2 = {
                contains: searchTerm,
                mode: "insensitive"
              };
              return {
                [relation]: {
                  some: {
                    [nestedRelation]: {
                      [nestedField]: stringFilter2
                    }
                  }
                }
              };
            }
          }
          const stringFilter = {
            contains: searchTerm,
            mode: "insensitive"
          };
          return {
            [field]: stringFilter
          };
        }
      );
      const whereConditions = this.query.where;
      whereConditions.OR = searchConditions;
      const countWhereConditions = this.countQuery.where;
      countWhereConditions.OR = searchConditions;
    }
    return this;
  }
  // /doctors?searchTerm=john&page=1&sortBy=name&specialty=cardiology&appointmentFee[lt]=100 => {}
  // { specialty: 'cardiology', appointmentFee: { lt: '100' } }
  filter() {
    const { filterableFields } = this.config;
    const excludedField = ["searchTerm", "page", "limit", "sortBy", "sortOrder", "fields", "include"];
    const filterParams = {};
    Object.keys(this.queryParams).forEach((key) => {
      if (!excludedField.includes(key)) {
        filterParams[key] = this.queryParams[key];
      }
    });
    const queryWhere = this.query.where;
    const countQueryWhere = this.countQuery.where;
    Object.keys(filterParams).forEach((key) => {
      const value = filterParams[key];
      if (value === void 0 || value === "") {
        return;
      }
      const isAllowedField = !filterableFields || filterableFields.length === 0 || filterableFields.includes(key);
      if (key.includes(".")) {
        const parts = key.split(".");
        if (filterableFields && !filterableFields.includes(key)) {
          return;
        }
        if (parts.length === 2) {
          const [relation, nestedField] = parts;
          if (!queryWhere[relation]) {
            queryWhere[relation] = {};
            countQueryWhere[relation] = {};
          }
          const queryRelation = queryWhere[relation];
          const countRelation = countQueryWhere[relation];
          queryRelation[nestedField] = this.parseFilterValue(value);
          countRelation[nestedField] = this.parseFilterValue(value);
          return;
        } else if (parts.length === 3) {
          const [relation, nestedRelation, nestedField] = parts;
          if (!queryWhere[relation]) {
            queryWhere[relation] = {
              some: {}
            };
            countQueryWhere[relation] = {
              some: {}
            };
          }
          const queryRelation = queryWhere[relation];
          const countRelation = countQueryWhere[relation];
          if (!queryRelation.some) {
            queryRelation.some = {};
          }
          if (!countRelation.some) {
            countRelation.some = {};
          }
          const querySome = queryRelation.some;
          const countSome = countRelation.some;
          if (!querySome[nestedRelation]) {
            querySome[nestedRelation] = {};
          }
          if (!countSome[nestedRelation]) {
            countSome[nestedRelation] = {};
          }
          const queryNestedRelation = querySome[nestedRelation];
          const countNestedRelation = countSome[nestedRelation];
          queryNestedRelation[nestedField] = this.parseFilterValue(value);
          countNestedRelation[nestedField] = this.parseFilterValue(value);
          return;
        }
      }
      if (!isAllowedField) {
        return;
      }
      if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        queryWhere[key] = this.parseRangeFilter(value);
        countQueryWhere[key] = this.parseRangeFilter(value);
        return;
      }
      queryWhere[key] = this.parseFilterValue(value);
      countQueryWhere[key] = this.parseFilterValue(value);
    });
    return this;
  }
  paginate() {
    const page = Number(this.queryParams.page) || 1;
    const limit = Number(this.queryParams.limit) || 10;
    this.page = page;
    this.limit = limit;
    this.skip = (page - 1) * limit;
    this.query.skip = this.skip;
    this.query.take = this.limit;
    return this;
  }
  sort() {
    const sortBy = this.queryParams.sortBy || "createdAt";
    const sortOrder = this.queryParams.sortOrder === "asc" ? "asc" : "desc";
    this.sortBy = sortBy;
    this.sortOrder = sortOrder;
    if (sortBy.includes(".")) {
      const parts = sortBy.split(".");
      if (parts.length === 2) {
        const [relation, nestedField] = parts;
        this.query.orderBy = {
          [relation]: {
            [nestedField]: sortOrder
          }
        };
      } else if (parts.length === 3) {
        const [relation, nestedRelation, nestedField] = parts;
        this.query.orderBy = {
          [relation]: {
            [nestedRelation]: {
              [nestedField]: sortOrder
            }
          }
        };
      } else {
        this.query.orderBy = {
          [sortBy]: sortOrder
        };
      }
    } else {
      this.query.orderBy = {
        [sortBy]: sortOrder
      };
    }
    return this;
  }
  fields() {
    const fieldsParam = this.queryParams.fields;
    if (fieldsParam && typeof fieldsParam === "string") {
      const fieldsArray = fieldsParam?.split(",").map((field) => field.trim());
      this.selectFields = {};
      fieldsArray?.forEach((field) => {
        if (this.selectFields) {
          this.selectFields[field] = true;
        }
      });
      this.query.select = this.selectFields;
      delete this.query.include;
    }
    return this;
  }
  include(relation) {
    if (this.selectFields) {
      return this;
    }
    this.query.include = { ...this.query.include, ...relation };
    return this;
  }
  dynamicInclude(includeConfig, defaultInclude) {
    if (this.selectFields) {
      return this;
    }
    const result = {};
    defaultInclude?.forEach((field) => {
      if (includeConfig[field]) {
        result[field] = includeConfig[field];
      }
    });
    const includeParam = this.queryParams.include;
    if (includeParam && typeof includeParam === "string") {
      const requestedRelations = includeParam.split(",").map((relation) => relation.trim());
      requestedRelations.forEach((relation) => {
        if (includeConfig[relation]) {
          result[relation] = includeConfig[relation];
        }
      });
    }
    this.query.include = { ...this.query.include, ...result };
    return this;
  }
  where(condition) {
    this.query.where = this.deepMerge(this.query.where, condition);
    this.countQuery.where = this.deepMerge(this.countQuery.where, condition);
    return this;
  }
  async execute() {
    const [total, data] = await Promise.all([
      this.model.count(this.countQuery),
      this.model.findMany(this.query)
    ]);
    const totalPages = Math.ceil(total / this.limit);
    return {
      data,
      meta: {
        page: this.page,
        limit: this.limit,
        total,
        totalPages
      }
    };
  }
  async count() {
    return await this.model.count(this.countQuery);
  }
  getQuery() {
    return this.query;
  }
  deepMerge(target, source) {
    const result = { ...target };
    for (const key in source) {
      if (source[key] && typeof source[key] === "object" && !Array.isArray(source[key])) {
        if (result[key] && typeof result[key] === "object" && !Array.isArray(result[key])) {
          result[key] = this.deepMerge(result[key], source[key]);
        } else {
          result[key] = source[key];
        }
      } else {
        result[key] = source[key];
      }
    }
    return result;
  }
  parseFilterValue(value) {
    if (value === "true") {
      return true;
    }
    if (value === "false") {
      return false;
    }
    if (typeof value === "string" && !isNaN(Number(value)) && value != "") {
      return Number(value);
    }
    if (Array.isArray(value)) {
      return { in: value.map((item) => this.parseFilterValue(item)) };
    }
    return value;
  }
  parseRangeFilter(value) {
    const rangeQuery = {};
    Object.keys(value).forEach((operator) => {
      const operatorValue = value[operator];
      const parsedValue = typeof operatorValue === "string" && !isNaN(Number(operatorValue)) ? Number(operatorValue) : operatorValue;
      switch (operator) {
        case "lt":
        case "lte":
        case "gt":
        case "gte":
        case "equals":
        case "not":
        case "contains":
        case "startsWith":
        case "endsWith":
          rangeQuery[operator] = parsedValue;
          break;
        case "in":
        case "notIn":
          if (Array.isArray(operatorValue)) {
            rangeQuery[operator] = operatorValue;
          } else {
            rangeQuery[operator] = [parsedValue];
          }
          break;
        default:
          break;
      }
    });
    return Object.keys(rangeQuery).length > 0 ? rangeQuery : value;
  }
};

// src/modules/project/project.service.ts
var createProjectIntoDB = async (payload) => {
  const result = await prisma_default.project.create({
    data: payload
  });
  return result;
};
var getAllProjectsFromDB = async (query) => {
  const finalQuery = { ...query, status: "APPROVED" };
  const projectQuery = new QueryBuilder(
    prisma_default.project,
    finalQuery,
    {
      searchableFields: ["title", "description", "student.name"],
      filterableFields: ["status", "goalAmount", "student.university"]
    }
  ).search().filter().sort().paginate().fields().dynamicInclude(
    { student: { select: { name: true, email: true, university: true } } },
    ["student"]
    // Default include student details
  );
  return await projectQuery.execute();
};
var getSingleProjectFromDB = async (id) => {
  return await prisma_default.project.findUniqueOrThrow({
    where: { id },
    include: {
      student: { select: { name: true, email: true, university: true } },
      donations: { include: { user: { select: { name: true } } } }
      // Show who donated
    }
  });
};
var updateProjectInDB = async (id, userId, payload) => {
  const project = await prisma_default.project.findUnique({ where: { id } });
  if (!project) throw new AppError_default(404, "Project not found");
  if (project.studentId !== userId) {
    throw new AppError_default(403, "Forbidden: You can only edit your own projects");
  }
  return await prisma_default.project.update({
    where: { id },
    data: payload
  });
};
var deleteProjectFromDB = async (id, userId) => {
  const project = await prisma_default.project.findUnique({ where: { id } });
  if (!project) throw new AppError_default(404, "Project not found");
  if (project.studentId !== userId) {
    throw new AppError_default(403, "Forbidden: You can only delete your own projects");
  }
  if (project.raisedAmount > 0) {
    throw new AppError_default(400, "Bad Request: Cannot delete a project that has already received funding");
  }
  return await prisma_default.project.delete({
    where: { id }
  });
};
var ProjectService = {
  createProjectIntoDB,
  getAllProjectsFromDB,
  getSingleProjectFromDB,
  updateProjectInDB,
  deleteProjectFromDB
};

// src/config/cloudinary.config.ts
var import_cloudinary = require("cloudinary");
var import_config2 = require("dotenv/config");
import_cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});
var cloudinaryInstance = import_cloudinary.v2;

// src/utils/cloudinary.ts
var import_streamifier = __toESM(require("streamifier"), 1);
var import_path = __toESM(require("path"), 1);
var uploadToCloudinary = (fileBuffer, folderName, resourceType = "auto", originalName) => {
  return new Promise((resolve, reject) => {
    const options = {
      folder: `fundingpanda/${folderName}`,
      // Cloudinary expects resource_type to be one of 'image'|'raw'|'video'
      resource_type: resourceType === "auto" ? "image" : resourceType
    };
    if ((resourceType === "raw" || resourceType === "auto") && originalName && resourceType === "raw") {
      const ext = import_path.default.extname(originalName);
      const uniqueSuffix = Math.random().toString(36).substring(2, 15);
      options.public_id = `${uniqueSuffix}${ext}`;
    }
    const uploadStream = cloudinaryInstance.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error("No result from Cloudinary"));
        return resolve({ secure_url: result.secure_url, public_id: result.public_id });
      }
    );
    import_streamifier.default.createReadStream(fileBuffer).pipe(uploadStream);
  });
};
var deleteFromCloudinary = (publicId, resourceType = "image") => {
  const resolvedType = resourceType === "auto" ? "image" : resourceType;
  return new Promise((resolve, reject) => {
    cloudinaryInstance.uploader.destroy(publicId, { resource_type: resolvedType }, (error, result) => {
      if (error) return reject(error);
      return resolve(result);
    });
  });
};
var extractCloudinaryPublicId = (url, resourceType) => {
  const parts = url.split("/fundingpanda/");
  if (parts.length !== 2) return "";
  const pathWithExt = `fundingpanda/${parts[1]}`;
  const resolvedType = resourceType === "auto" ? "image" : resourceType;
  return resolvedType === "raw" ? pathWithExt : pathWithExt.substring(0, pathWithExt.lastIndexOf(".")) || pathWithExt;
};

// src/modules/project/project.controller.ts
var createProject = catchAsync_default(async (req, res) => {
  const studentId = req.user?.id;
  let pitchDocUrl = null;
  const imageUrls = [];
  const files = req.files;
  if (files) {
    if (files.pitchDoc && files.pitchDoc.length > 0) {
      const file = files.pitchDoc[0];
      const docUpload = await uploadToCloudinary(file.buffer, "pitch-docs", "image", file.originalname);
      pitchDocUrl = docUpload.secure_url;
    }
    if (files.images && files.images.length > 0) {
      for (const file of files.images) {
        const imageUpload = await uploadToCloudinary(file.buffer, "prototypes", "image", file.originalname);
        imageUrls.push(imageUpload.secure_url);
      }
    }
  }
  const projectData = {
    ...req.body,
    studentId,
    pitchDocUrl,
    // Add Cloudinary URL to DB
    images: imageUrls
    // Add Cloudinary URLs to DB
  };
  const result = await ProjectService.createProjectIntoDB(projectData);
  sendResponse_default(res, {
    statusCode: 201,
    success: true,
    message: "Project and media created successfully",
    data: result
  });
});
var getAllProjects = catchAsync_default(async (req, res) => {
  const result = await ProjectService.getAllProjectsFromDB(req.query);
  sendResponse_default(res, {
    statusCode: 200,
    success: true,
    message: "Projects retrieved successfully",
    data: result.data,
    // Access the data array
    meta: result.meta
    // Access the pagination metadata
  });
});
var getSingleProject = catchAsync_default(async (req, res) => {
  const result = await ProjectService.getSingleProjectFromDB(req.params.id);
  sendResponse_default(res, { statusCode: 200, success: true, message: "Project retrieved successfully", data: result });
});
var updateProject = catchAsync_default(async (req, res) => {
  const projectId = req.params.id;
  const userId = req.user?.id;
  const existingProject = await ProjectService.getSingleProjectFromDB(projectId);
  let newPitchDocUrl = existingProject.pitchDocUrl;
  const newImageUrls = [...existingProject.images];
  const files = req.files;
  if (files && files.pitchDoc && files.pitchDoc.length > 0) {
    if (existingProject.pitchDocUrl) {
      const publicId = extractCloudinaryPublicId(existingProject.pitchDocUrl, "raw");
      if (publicId) await deleteFromCloudinary(publicId, "raw");
    }
    const file = files.pitchDoc[0];
    const docUpload = await uploadToCloudinary(file.buffer, "pitch-docs", "image", file.originalname);
    newPitchDocUrl = docUpload.secure_url;
  }
  if (files && files.images && files.images.length > 0) {
    for (const oldImageUrl of existingProject.images) {
      const publicId = extractCloudinaryPublicId(oldImageUrl, "image");
      if (publicId) await deleteFromCloudinary(publicId, "image");
    }
    newImageUrls.length = 0;
    for (const file of files.images) {
      const imageUpload = await uploadToCloudinary(file.buffer, "prototypes", "image");
      newImageUrls.push(imageUpload.secure_url);
    }
  }
  const updateData = {
    ...req.body,
    pitchDocUrl: newPitchDocUrl,
    images: newImageUrls
  };
  const result = await ProjectService.updateProjectInDB(projectId, userId, updateData);
  sendResponse_default(res, { statusCode: 200, success: true, message: "Project updated successfully", data: result });
});
var deleteProject = catchAsync_default(async (req, res) => {
  const userId = req.user?.id;
  const result = await ProjectService.deleteProjectFromDB(req.params.id, userId);
  sendResponse_default(res, { statusCode: 200, success: true, message: "Project deleted successfully", data: result });
});
var ProjectController = {
  createProject,
  getAllProjects,
  getSingleProject,
  updateProject,
  deleteProject
};

// src/middlewares/validateRequest.ts
var validateRequest = (schema) => {
  return async (req, res, next) => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (err) {
      next(err);
    }
  };
};
var validateRequest_default = validateRequest;

// src/modules/project/project.validation.ts
var import_zod = require("zod");
var createProjectZodSchema = import_zod.z.object({
  title: import_zod.z.string().nonempty({ message: "Title is required" }),
  description: import_zod.z.string().nonempty({ message: "Description is required" }),
  goalAmount: import_zod.z.coerce.number().positive({ message: "Goal amount must be positive" })
});
var ProjectValidation = {
  createProjectZodSchema
};

// src/modules/project/project.route.js
var import_client4 = require("@prisma/client");

// src/middlewares/upload.ts
var import_multer = __toESM(require("multer"), 1);
var storage = import_multer.default.memoryStorage();
var upload = (0, import_multer.default)({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024
    // 10 MB limit for PDFs and Images
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf", "video/mp4"];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError_default(400, "Invalid file type. Only JPG, PNG, WEBP, PDF, and MP4 are allowed."));
    }
  }
});

// src/middlewares/parseFormData.ts
var parseFormData = (req, res, next) => {
  if (req.body.data) {
    try {
      req.body = JSON.parse(req.body.data);
    } catch (error) {
      return res.status(400).json({ success: false, message: "Invalid JSON format in form data" });
    }
  }
  next();
};
var parseFormData_default = parseFormData;

// src/modules/project/project.route.js
var router2 = (0, import_express2.Router)();
router2.post(
  "/create-project",
  checkAuth_default("STUDENT"),
  upload.fields([
    { name: "pitchDoc", maxCount: 1 },
    // Max 1 PDF
    { name: "images", maxCount: 5 }
    // Max 5 Images
  ]),
  parseFormData_default,
  // Parse the JSON data before Zod checks it
  validateRequest_default(ProjectValidation.createProjectZodSchema),
  ProjectController.createProject
);
router2.get("/", ProjectController.getAllProjects);
router2.get("/:id", ProjectController.getSingleProject);
router2.patch(
  "/:id",
  checkAuth_default("STUDENT"),
  upload.fields([
    { name: "pitchDoc", maxCount: 1 },
    { name: "images", maxCount: 5 }
  ]),
  parseFormData_default,
  ProjectController.updateProject
  // We will update this next
);
router2.delete("/:id", checkAuth_default(import_client4.UserRole.STUDENT, import_client4.UserRole.ADMIN), ProjectController.deleteProject);
var ProjectRoutes = router2;

// src/modules/resource/resource.route.ts
var import_express3 = require("express");

// src/modules/resource/resource.service.ts
var import_client5 = require("@prisma/client");
var createResourceIntoDB = async (payload) => {
  const total = payload.totalQuantity !== void 0 ? Number(payload.totalQuantity) : 1;
  const available = payload.availableQuantity !== void 0 ? Number(payload.availableQuantity) : total;
  const typeValue = payload.type ? payload.type : import_client5.ResourceType.HARDWARE;
  const data = {
    name: payload.name,
    description: payload.description,
    type: typeValue,
    totalQuantity: total,
    availableQuantity: available,
    lender: {
      connect: { id: payload.lenderId }
    },
    categories: payload && payload.categories ? {
      connect: payload.categories.map((c) => ({ id: c }))
    } : void 0
  };
  return await prisma_default.resource.create({ data });
};
var getAllResourcesFromDB = async (query) => {
  const resourceQuery = new QueryBuilder(
    prisma_default.resource,
    query,
    {
      searchableFields: ["name", "description", "lender.name"],
      filterableFields: ["type", "availableQuantity", "lenderId"]
    }
  ).search().filter().sort().paginate().fields().dynamicInclude(
    { lender: { select: { name: true, email: true, bio: true } } },
    ["lender"]
  );
  return await resourceQuery.execute();
};
var getSingleResourceFromDB = async (id) => {
  return await prisma_default.resource.findUniqueOrThrow({
    where: { id },
    include: {
      lender: { select: { name: true, email: true, bio: true } }
    }
  });
};
var updateResourceInDB = async (id, userId, payload) => {
  const resource = await prisma_default.resource.findUnique({ where: { id } });
  if (!resource) throw new AppError_default(404, "Resource not found");
  if (resource.lenderId !== userId) {
    throw new AppError_default(403, "Forbidden: You can only edit your own resources");
  }
  const updateData = {};
  if (payload.name !== void 0) updateData.name = payload.name;
  if (payload.type !== void 0) updateData.type = payload.type;
  if (payload.description !== void 0) updateData.description = payload.description;
  if (payload.totalQuantity !== void 0) updateData.totalQuantity = payload.totalQuantity;
  if (payload.availableQuantity !== void 0) updateData.availableQuantity = payload.availableQuantity;
  return await prisma_default.resource.update({
    where: { id },
    data: updateData
  });
};
var deleteResourceFromDB = async (id, userId) => {
  const resource = await prisma_default.resource.findUnique({ where: { id } });
  if (!resource) throw new AppError_default(404, "Resource not found");
  if (resource.lenderId !== userId) {
    throw new AppError_default(403, "Forbidden: You can only delete your own resources");
  }
  const available = resource.availableQuantity ?? 0;
  const total = resource.totalQuantity ?? 0;
  if (available < total) {
    throw new AppError_default(400, "Bad Request: Cannot delete a resource with active allocations");
  }
  return await prisma_default.resource.delete({ where: { id } });
};
var ResourceService = {
  createResourceIntoDB,
  getAllResourcesFromDB,
  getSingleResourceFromDB,
  updateResourceInDB,
  deleteResourceFromDB
};

// src/modules/resource/resource.controller.ts
var createResource = catchAsync_default(async (req, res) => {
  const lenderId = req.user?.id;
  const resourceData = {
    ...req.body,
    lenderId
  };
  const result = await ResourceService.createResourceIntoDB(resourceData);
  sendResponse_default(res, {
    statusCode: 201,
    success: true,
    message: "Resource listed successfully",
    data: result
  });
});
var getAllResources = catchAsync_default(async (req, res) => {
  const result = await ResourceService.getAllResourcesFromDB(req.query);
  sendResponse_default(res, {
    statusCode: 200,
    success: true,
    message: "Resources retrieved successfully",
    meta: result.meta,
    data: result.data
  });
});
var getSingleResource = catchAsync_default(async (req, res) => {
  const result = await ResourceService.getSingleResourceFromDB(req.params.id);
  sendResponse_default(res, { statusCode: 200, success: true, message: "Resource retrieved successfully", data: result });
});
var updateResource = catchAsync_default(async (req, res) => {
  const userId = req.user?.id;
  const result = await ResourceService.updateResourceInDB(req.params.id, userId, req.body);
  sendResponse_default(res, { statusCode: 200, success: true, message: "Resource updated successfully", data: result });
});
var deleteResource = catchAsync_default(async (req, res) => {
  const userId = req.user?.id;
  const result = await ResourceService.deleteResourceFromDB(req.params.id, userId);
  sendResponse_default(res, { statusCode: 200, success: true, message: "Resource deleted successfully", data: result });
});
var ResourceController = {
  createResource,
  getAllResources,
  getSingleResource,
  updateResource,
  deleteResource
};

// src/modules/resource/resource.validation.ts
var import_zod2 = require("zod");
var createResourceZodSchema = import_zod2.z.object({
  name: import_zod2.z.string().nonempty({ message: "Resource name is required" }),
  type: import_zod2.z.enum(["HARDWARE", "SOFTWARE"]).optional(),
  description: import_zod2.z.string().nonempty({ message: "Description is required" }),
  totalQuantity: import_zod2.z.coerce.number().optional()
});
var ResourceValidation = {
  createResourceZodSchema
};

// src/modules/resource/resource.route.ts
var import_client6 = require("@prisma/client");
var router3 = (0, import_express3.Router)();
router3.post(
  "/list-resource",
  checkAuth_default(import_client6.UserRole.SPONSOR),
  validateRequest_default(ResourceValidation.createResourceZodSchema),
  ResourceController.createResource
);
router3.get("/", ResourceController.getAllResources);
router3.get("/:id", ResourceController.getSingleResource);
router3.patch(
  "/:id",
  checkAuth_default("SPONSOR"),
  ResourceController.updateResource
);
router3.delete(
  "/:id",
  checkAuth_default("SPONSOR", "ADMIN"),
  // Admins can also delete inappropriate resource listings
  ResourceController.deleteResource
);
var ResourceRoutes = router3;

// src/modules/donation/donation.route.ts
var import_express4 = require("express");

// src/config/stripe.config.ts
var import_stripe = __toESM(require("stripe"), 1);
var import_config3 = require("dotenv/config");
var stripe = new import_stripe.default(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2026-02-25.clover"
});

// src/modules/donation/donation.service.ts
var createDonationIntoDB = async (payload) => {
  const project = await prisma_default.project.findUnique({ where: { id: payload.projectId } });
  if (!project) throw new AppError_default(404, "Project not found");
  if (project.status !== "APPROVED") {
    throw new AppError_default(400, "Bad Request: You can only donate to APPROVED projects");
  }
  const [donation, updatedProject] = await prisma_default.$transaction([
    prisma_default.donation.create({ data: payload }),
    prisma_default.project.update({
      where: { id: payload.projectId },
      data: { raisedAmount: { increment: payload.amount } }
    })
  ]);
  return { donation, updatedProject };
};
var getAllDonationsFromDB = async (query) => {
  const donationQuery = new QueryBuilder(
    prisma_default.donation,
    query,
    {
      searchableFields: ["user.name", "project.title"],
      filterableFields: ["amount", "projectId", "userId"]
    }
  ).search().filter().sort().paginate().fields().dynamicInclude(
    {
      user: { select: { name: true, email: true } },
      project: { select: { title: true, goalAmount: true, raisedAmount: true } }
    },
    ["user", "project"]
  );
  return await donationQuery.execute();
};
var createCheckoutSession = async (userId, payload) => {
  const project = await prisma_default.project.findUnique({ where: { id: payload.projectId } });
  if (!project) throw new AppError_default(404, "Project not found");
  if (project.status !== "APPROVED") {
    throw new AppError_default(400, "Bad Request: You can only donate to APPROVED projects");
  }
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONTEND_URL}/projects/${payload.projectId}`,
    customer_email: void 0,
    // we could fetch the user's email and put it here
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `Donation to: ${project.title}`,
            description: `Funding thesis project for student ID: ${project.studentId}`
          },
          unit_amount: Math.round(payload.amount * 100)
          // Stripe expects amounts in cents!
        },
        quantity: 1
      }
    ],
    metadata: {
      userId,
      projectId: payload.projectId
    }
  });
  return { paymentUrl: session.url };
};
var DonationService = {
  createDonationIntoDB,
  getAllDonationsFromDB,
  createCheckoutSession
};

// src/modules/donation/donation.controller.ts
var createDonation = catchAsync_default(async (req, res) => {
  const userId = req.user?.id;
  const donationData = {
    ...req.body,
    userId
  };
  const result = await DonationService.createDonationIntoDB(donationData);
  sendResponse_default(res, {
    statusCode: 201,
    success: true,
    message: "Donation successful!",
    data: result
  });
});
var getAllDonations = catchAsync_default(async (req, res) => {
  const result = await DonationService.getAllDonationsFromDB(req.query);
  sendResponse_default(res, {
    statusCode: 200,
    success: true,
    message: "Donations retrieved successfully",
    meta: result.meta,
    // Add pagination meta
    data: result.data
  });
});
var initiatePayment = catchAsync_default(async (req, res) => {
  const userId = req.user?.id;
  const result = await DonationService.createCheckoutSession(userId, req.body);
  sendResponse_default(res, {
    statusCode: 200,
    success: true,
    message: "Payment session initiated successfully",
    data: result
    // This contains the { paymentUrl }
  });
});
var DonationController = {
  createDonation,
  getAllDonations,
  initiatePayment
};

// src/modules/donation/donation.validation.ts
var import_zod3 = require("zod");
var createDonationZodSchema = import_zod3.z.object({
  amount: import_zod3.z.number().positive({ message: "Amount must be positive" }),
  projectId: import_zod3.z.string().nonempty({ message: "Project ID is required" })
});
var DonationValidation = {
  createDonationZodSchema
};

// src/modules/donation/donation.route.ts
var import_client7 = require("@prisma/client");
var router4 = (0, import_express4.Router)();
router4.post(
  "/create-donation",
  checkAuth_default(import_client7.UserRole.SPONSOR),
  validateRequest_default(DonationValidation.createDonationZodSchema),
  DonationController.createDonation
);
router4.get("/", DonationController.getAllDonations);
router4.post(
  "/initiate-payment",
  checkAuth_default("SPONSOR"),
  validateRequest_default(DonationValidation.createDonationZodSchema),
  DonationController.initiatePayment
);
var DonationRoutes = router4;

// src/modules/admin/admin.route.ts
var import_express5 = require("express");

// src/modules/admin/admin.service.ts
var verifyUserInDB = async (userId, payload) => {
  const result = await prisma_default.user.update({
    where: { id: userId },
    data: { isVerified: payload.isVerified }
  });
  return result;
};
var changeProjectStatusInDB = async (projectId, payload) => {
  return await prisma_default.project.update({
    where: { id: projectId },
    data: {
      status: payload.status,
      adminFeedback: payload.feedback || null
      // Save feedback or clear it
    }
  });
};
var getPlatformAnalytics = async () => {
  const [
    totalUsers,
    totalProjects,
    pendingProjects,
    totalResources,
    totalDonationsAggregation
  ] = await Promise.all([
    prisma_default.user.count(),
    prisma_default.project.count(),
    prisma_default.project.count({ where: { status: "PENDING" } }),
    prisma_default.resource.count(),
    prisma_default.donation.aggregate({ _sum: { amount: true } })
  ]);
  return {
    totalUsers,
    totalProjects,
    pendingProjects,
    totalResources,
    totalFundsRaised: totalDonationsAggregation._sum.amount || 0
  };
};
var AdminService = {
  verifyUserInDB,
  changeProjectStatusInDB,
  getPlatformAnalytics
};

// src/modules/admin/admin.controller.ts
var verifyUser = catchAsync_default(async (req, res) => {
  const { id } = req.params;
  const payload = req.body;
  const result = await AdminService.verifyUserInDB(id, payload);
  sendResponse_default(res, {
    statusCode: 200,
    success: true,
    message: "User verification status updated successfully",
    data: result
  });
});
var changeProjectStatus = catchAsync_default(async (req, res) => {
  const { id } = req.params;
  const payload = req.body;
  const result = await AdminService.changeProjectStatusInDB(id, payload);
  sendResponse_default(res, {
    statusCode: 200,
    success: true,
    message: `Project status updated to ${result.status}`,
    data: result
  });
});
var getAnalytics = catchAsync_default(async (req, res) => {
  const result = await AdminService.getPlatformAnalytics();
  sendResponse_default(res, { statusCode: 200, success: true, message: "Analytics retrieved", data: result });
});
var AdminController = {
  verifyUser,
  changeProjectStatus,
  getAnalytics
};

// src/modules/admin/admin.validation.ts
var import_zod4 = require("zod");
var import_client8 = require("@prisma/client");
var updateProjectStatusZodSchema = import_zod4.z.object({
  status: import_zod4.z.nativeEnum(import_client8.ProjectStatus, {
    message: "Status is required"
  }),
  feedback: import_zod4.z.string().optional()
});
var verifyUserZodSchema = import_zod4.z.object({
  isVerified: import_zod4.z.boolean({ message: "isVerified boolean is required" })
});
var AdminValidation = {
  updateProjectStatusZodSchema,
  verifyUserZodSchema
};

// src/modules/admin/admin.route.ts
var router5 = (0, import_express5.Router)();
router5.patch(
  "/users/:id/verify",
  checkAuth_default("ADMIN"),
  validateRequest_default(AdminValidation.verifyUserZodSchema),
  AdminController.verifyUser
);
router5.patch(
  "/projects/:id/status",
  checkAuth_default("ADMIN"),
  validateRequest_default(AdminValidation.updateProjectStatusZodSchema),
  AdminController.changeProjectStatus
);
router5.get("/analytics", checkAuth_default("ADMIN"), AdminController.getAnalytics);
var AdminRoutes = router5;

// src/routes/index.ts
var router6 = (0, import_express6.Router)();
var moduleRoutes = [
  {
    path: "/users",
    route: UserRoutes
  },
  {
    path: "/projects",
    route: ProjectRoutes
  },
  {
    path: "/resources",
    route: ResourceRoutes
  },
  {
    path: "/donations",
    route: DonationRoutes
  },
  {
    path: "/admin",
    route: AdminRoutes
  }
];
moduleRoutes.forEach((route) => router6.use(route.path, route.route));
router6.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "fundingPanda API is running smoothly!"
  });
});
var routes_default = router6;

// src/middlewares/globalErrorHandler.ts
var import_zod5 = require("zod");
var import_client9 = require("@prisma/client");
var globalErrorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Something went wrong!";
  let errorSources = err;
  if (err instanceof AppError_default) {
    statusCode = err.statusCode || statusCode;
    message = err.message || message;
    errorSources = err;
    return res.status(statusCode).json({
      success: false,
      message,
      errorSources
    });
  }
  if (err instanceof import_zod5.ZodError) {
    statusCode = 400;
    message = "Validation Error";
    errorSources = err.issues.map((issue) => ({
      path: issue.path[issue.path.length - 1],
      message: issue.message
    }));
  } else if (err instanceof import_client9.Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      statusCode = 409;
      message = "Duplicate Entry";
      const target = err.meta?.target?.join(", ") || "field";
      errorSources = [{ path: target, message: `The ${target} is already in use.` }];
    } else if (err.code === "P2025") {
      statusCode = 404;
      message = "Record Not Found";
      errorSources = [{ path: "", message: err.meta?.cause || "The requested record does not exist in the database." }];
    } else {
      statusCode = 400;
      message = "Database Query Error";
      errorSources = [{ path: "", message: err.message }];
    }
  } else if (err instanceof import_client9.Prisma.PrismaClientValidationError) {
    statusCode = 400;
    message = "Database Validation Error";
    errorSources = [{ path: "", message: "Invalid data provided for database query." }];
  }
  return res.status(statusCode).json({
    success: false,
    message,
    errorSources
  });
};
var globalErrorHandler_default = globalErrorHandler;

// src/middlewares/notFound.ts
var notFound = (req, res, next) => {
  return res.status(404).json({
    success: false,
    message: "API Route Not Found",
    errorSources: [
      {
        path: req.originalUrl,
        message: "The requested route does not exist on this server."
      }
    ]
  });
};
var notFound_default = notFound;

// src/app.ts
var import_node = require("better-auth/node");
var import_config4 = require("dotenv/config");

// src/modules/donation/donation.webhook.ts
var handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const projectId = session.metadata?.projectId;
    const userId = session.metadata?.userId;
    const amountInCents = session.amount_total;
    if (projectId && userId && amountInCents) {
      const amount = amountInCents / 100;
      try {
        await DonationService.createDonationIntoDB({ amount, projectId, userId });
        console.log(`Payment success! Donation recorded for Project: ${projectId}`);
      } catch (dbError) {
        console.error("Database update failed after successful payment:", dbError);
      }
    }
  }
  res.json({ received: true });
};
var DonationWebhook = { handleStripeWebhook };

// src/app.ts
var app = (0, import_express7.default)();
app.post(
  "/api/v1/donations/webhook",
  import_express7.default.raw({ type: "application/json" }),
  DonationWebhook.handleStripeWebhook
);
app.use(import_express7.default.json());
app.use((0, import_helmet.default)());
app.use((0, import_cors.default)({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
  // Required for cookies/sessions
}));
var betterAuthBaseURL = process.env.BETTER_AUTH_URL || `http://localhost:${process.env.PORT || 5e3}`;
app.use("/api/auth", (req, _res, next) => {
  console.log("BetterAuth request headers:", {
    origin: req.headers.origin,
    host: req.headers.host,
    referer: req.headers.referer
  });
  const headersTyped = req.headers;
  if (process.env.NODE_ENV !== "production" && !headersTyped.origin) {
    headersTyped.origin = betterAuthBaseURL;
  }
  next();
}, (0, import_node.toNodeHandler)(auth));
app.use("/api/v1", routes_default);
app.use(globalErrorHandler_default);
app.use(notFound_default);
var app_default = app;

// src/server.ts
var import_config5 = require("dotenv/config");
var PORT = process.env.PORT || 5e3;
async function bootstrap() {
  try {
    app_default.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
  }
}
bootstrap();
