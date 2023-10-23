import { Injectable } from '@nestjs/common';
import {
  Document,
  FilterQuery,
  Model,
  UpdateQuery,
  UpdateWriteOpResult,
} from 'mongoose';
import { ObjectId } from 'mongodb';

@Injectable()
export abstract class GenericCrudService<T extends Document> {
  constructor(private readonly model: Model<T>) {}

  //! DEFAULT CRUD METHODS

  async create(args: {
    document: any;
    projection?: string | Record<string, unknown> | any;
    populate?: any[];
    options?: Record<string, unknown>;
    reqUser?: any;
    ignoreArchived?: boolean;
  }): Promise<T> {
    // if system is null then set default value to false
    if (args.document?.['system.archived'] == null) {
      args.document.system = { archived: false };
    }

    const createdDocument = await this.model.create(args.document);

    const result = await this.findOne({
      conditions: prepareCondition({ _id: createdDocument._id }),
      projection: args.projection,
      populate: args.populate,
      options: args.options,
      ignoreArchived: args.ignoreArchived ? true : false,
    });

    return result ? JSON.parse(JSON.stringify(result)) : null;
  }

  //! FIND

  async findOne(args: {
    conditions: Partial<Record<keyof T | string, unknown>>;
    projection?: { [field: string]: any };
    options?: Record<string, unknown>;
    populate?: any[];
    reqUser?: any;
    ignoreArchived?: boolean;
  }): Promise<any | null> {
    let aggregationPipeline = [];
    const archivedQuery = { 'system.archived': { $ne: true } };

    // if ignore archived true then remove archived query
    if (args.ignoreArchived) {
      delete archivedQuery['system.archived'];
    }

    if (args.conditions) {
      aggregationPipeline.push({
        $match: prepareCondition({ ...archivedQuery, ...args.conditions }),
      });
    }

    if (args.projection && Object.keys(args.projection).length !== 0) {
      aggregationPipeline.push({ $project: args.projection });
    }

    if (args.options) {
      aggregationPipeline = [
        ...aggregationPipeline,
        ...handleGenericOptions(args.options),
      ];
    }

    aggregationPipeline.push({ $limit: 1 });

    let result = await this.model.aggregate(aggregationPipeline);

    if (!result) {
      return null;
    }

    if (args.populate) {
      result = await this.model.populate(result, args.populate);
    }

    return result[0] ? JSON.parse(JSON.stringify(result[0])) : null;
  }

  async find(args: {
    conditions: Partial<Record<keyof T, unknown>> | any;
    projection?: string | Record<string, unknown> | any;
    options?: Record<string, unknown>;
    populate?: any[];
    reqUser?: any;
    ignoreArchived?: boolean;
  }): Promise<T[]> {
    let aggregationPipeline = [];
    const archivedQuery = { 'system.archived': { $ne: true } };

    // if ignore archived true then remove archived query
    if (args.ignoreArchived) {
      delete archivedQuery['system.archived'];
    }

    if (args.conditions) {
      aggregationPipeline.push({
        $match: prepareCondition({ ...archivedQuery, ...args.conditions }),
      });
    }

    if (args.projection && Object.keys(args.projection).length !== 0) {
      aggregationPipeline.push({ $project: args.projection });
    }

    if (args.options) {
      aggregationPipeline = [
        ...aggregationPipeline,
        ...handleGenericOptions(args.options),
      ];
    }

    let result = await this.model.aggregate(aggregationPipeline);

    if (args.populate) {
      result = await this.model.populate(result, args.populate);
    }

    return result ? JSON.parse(JSON.stringify(result)) : [];
  }

  //! UPDATE

  async findOneAndUpdate(args: {
    conditions: Partial<Record<keyof T | string, unknown>>;
    changes: UpdateQuery<T>;
    projection?: string | Record<string, unknown> | any;
    populate?: any[];
    options?: Record<string, unknown>;
    reqUser?: any;
  }): Promise<T> {
    const archivedQuery = { 'system.archived': { $ne: true } };

    if (!args.options) {
      args.options = {};
    }

    await this.model.updateOne(
      { ...archivedQuery, ...args.conditions } as FilterQuery<T>,
      args.changes,
      args.options,
    );

    const result = await this.findOne({
      conditions: prepareCondition({ ...archivedQuery, ...args.conditions }),
      projection: args.projection,
      populate: args.populate,
      options: args.options,
    });

    return result ? JSON.parse(JSON.stringify(result)) : null;
  }

  async updateOne(args: {
    conditions: Partial<Record<keyof T | string, unknown>>;
    changes: UpdateQuery<T>;
    projection?: string | Record<string, unknown> | any;
    populate?: any[];
    options?: Record<string, unknown>;
    reqUser?: any;
    ignoreArchived?: boolean;
  }): Promise<T> {
    const archivedQuery = { 'system.archived': { $ne: true } };

    if (!args.options) {
      args.options = { new: true };
    } else {
      args.options = { ...args.options, new: true };
    }

    // if ignore archived true then remove archived query
    if (args.ignoreArchived) {
      delete archivedQuery['system.archived'];
    }

    await this.model.updateOne(
      prepareCondition({ ...archivedQuery, ...args.conditions }),
      args.changes,
      args.options,
    );

    const result = await this.findOne({
      conditions: prepareCondition({ ...archivedQuery, ...args.conditions }),
      projection: args.projection,
      populate: args.populate,
      options: args.options,
      ignoreArchived: args.ignoreArchived ? true : false,
    });

    return result ? JSON.parse(JSON.stringify(result)) : null;
  }

  async updateMany(args: {
    conditions: Partial<Record<keyof T | string, unknown>>;
    changes: UpdateQuery<T>;
    options?: Record<string, unknown>;
    ignoreArchived?: boolean;
  }): Promise<UpdateWriteOpResult> {
    const archivedQuery = { 'system.archived': { $ne: true } };

    if (!args.options) {
      args.options = { new: true };
    } else {
      args.options = { ...args.options, new: true };
    }

    // if ignore archived true then remove archived query
    if (args.ignoreArchived) {
      delete archivedQuery['system.archived'];
    }

    return await this.model.updateMany(
      prepareCondition({ ...archivedQuery, ...args.conditions }),
      args.changes,
      args.options,
    );
  }

  //! DELETE

  async deleteOne(args: {
    conditions: Partial<Record<keyof T | string, unknown>>;
    options?: Record<string, unknown>;
    reqUser?: any;
  }): Promise<T> {
    if (!args.options) {
      args.options = {};
    }

    const result = await this.model.findOneAndDelete(
      prepareCondition(args.conditions),
      args.options,
    );

    return result ? JSON.parse(JSON.stringify(result)) : null;
  }

  async delete(args: {
    conditions: Partial<Record<keyof T | string, unknown>>;
    options?: Record<string, unknown>;
  }): Promise<any> {
    if (!args.options) {
      args.options = {};
    }

    const result = await this.model.deleteMany(
      prepareCondition(args.conditions),
      args.options,
    );

    return result ? JSON.parse(JSON.stringify(result)) : [];
  }

  //! ARCHIVE

  async archiveOne(args: {
    conditions: Partial<Record<keyof T | string, unknown>>;
    options?: Record<string, unknown>;
  }): Promise<UpdateWriteOpResult> {
    if (!args.options) {
      args.options = { new: true };
    } else {
      args.options = { ...args.options, new: true };
    }

    // set archived to true and archivedAt to current date
    const archiveDocument = {
      $set: {
        'system.archived': true,
        'system.archivedAt': new Date(),
      },
    };

    return await this.model.updateOne(
      prepareCondition(args.conditions),
      archiveDocument,
      args.options,
    );
  }

  async archiveMany(args: {
    conditions: Partial<Record<keyof T | string, unknown>>;
    options?: Record<string, unknown>;
  }): Promise<UpdateWriteOpResult> {
    if (!args.options) {
      args.options = { new: true };
    } else {
      args.options = { ...args.options, new: true };
    }

    // set archived to true and archivedAt to current date
    const archiveDocument = {
      $set: {
        'system.archived': true,
        'system.archivedAt': new Date(),
      },
    };

    return await this.model.updateMany(
      prepareCondition(args.conditions),
      archiveDocument,
      args.options,
    );
  }

  async unarchiveOne(args: {
    conditions: Partial<Record<keyof T | string, unknown>>;
    options?: Record<string, unknown>;
  }): Promise<UpdateWriteOpResult> {
    if (!args.options) {
      args.options = { new: true };
    } else {
      args.options = { ...args.options, new: true };
    }

    // set archived to true and archivedAt to current date
    const archiveDocument = {
      $set: {
        'system.archived': false,
        'system.archivedAt': null,
      },
    };

    return await this.model.updateOne(
      prepareCondition(args.conditions),
      archiveDocument,
      args.options,
    );
  }

  async findArchived(args: {
    conditions: Partial<Record<keyof T, unknown>> | any;
    projection?: string | Record<string, unknown> | any;
    options?: Record<string, unknown>;
    populate?: any[];
    reqUser?: any;
  }): Promise<T[]> {
    let aggregationPipeline = [];
    const archivedQuery = { 'system.archived': true };

    if (args.conditions) {
      aggregationPipeline.push({
        $match: prepareCondition({ ...archivedQuery, ...args.conditions }),
      });
    }

    if (args.projection && Object.keys(args.projection).length !== 0) {
      aggregationPipeline.push({ $project: args.projection });
    }

    if (args.options) {
      aggregationPipeline = [
        ...aggregationPipeline,
        ...handleGenericOptions(args.options),
      ];
    }

    let result = await this.model.aggregate(aggregationPipeline);

    if (args.populate) {
      result = await this.model.populate(result, args.populate);
    }

    return result ? JSON.parse(JSON.stringify(result)) : [];
  }

  //! ATLAS SEARCH METHODS

  genericSearch = async (args: {
    must?: any[];
    should?: any[];
    mustNot?: any[];
    filter?: any[];
    populate?: any[];
    projection?: string | Record<string, unknown> | any;
    additionalStage?: any;
  }) => {
    //
    let searchQuery = {};
    let searchResult;

    const aggregationPipeline = [];

    // check with operators are used and add them to the searchQuery
    if (args.filter) {
      searchQuery['filter'] = args.filter;
    }

    if (args.must) {
      searchQuery['must'] = args.must;
    }

    if (args.mustNot) {
      searchQuery['mustNot'] = args.mustNot;
    }

    if (args.should) {
      searchQuery['should'] = args.should;
    }

    // check if compound object is needed (if more than one operator)
    if (searchQuery && Object.keys(searchQuery).length > 1) {
      searchQuery = { compound: searchQuery };
    }

    if (!searchQuery) {
      // throw new RequestHttpException( // TODO configure error handling
      //   {
      //     className: 'GenericCrudService',
      //     methodName: 'genericSearch',
      //     messagePath: 'error.INVALID_REQUEST',
      //   },
      //   400,
      // );
    }

    if (args.additionalStage) {
      aggregationPipeline.push(
        {
          $search: {
            ...searchQuery,
          },
        },
        { ...args.additionalStage },
        {
          $limit: 30,
        },
      );
    } else {
      aggregationPipeline.push(
        {
          $search: {
            ...searchQuery,
          },
        },
        {
          $limit: 30,
        },
      );
    }

    if (args.projection && Object.keys(args.projection).length !== 0) {
      aggregationPipeline.push({ $project: args.projection });
    }

    searchResult = await this.model.aggregate(aggregationPipeline);

    if (args.populate) {
      searchResult = await this.model.populate(searchResult, args.populate);
    }

    return searchResult;
  };
}

export const prepareCondition = (condition: any) => {
  const objKeys = Object.keys(condition);

  for (let i = 0; i < objKeys.length; i++) {
    const objectKey = objKeys[i];
    const objectValue = condition[objectKey];

    if (condition[objectKey] == null) {
      continue;
    }

    if (typeof objectValue === 'object') {
      condition[objectKey] = prepareCondition(objectValue);
    }

    if (objectValue.toString().length === 24 && ObjectId.isValid(objectValue)) {
      condition[objectKey] = new ObjectId(objectValue);
    }
  }

  return condition;
};

export const handleGenericOptions = (options: any) => {
  const aggregationPipeline = [];

  if (options.sort) {
    aggregationPipeline.push({ $sort: options.sort });
  }

  if (options.skip) {
    aggregationPipeline.push({ $skip: options.skip });
  }

  if (options.limit) {
    aggregationPipeline.push({ $limit: options.limit });
  }

  return aggregationPipeline;
};
