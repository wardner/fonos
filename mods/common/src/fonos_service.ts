/*
 * Copyright (C) 2021 by Fonoster Inc (https://fonoster.com)
 * http://github.com/fonoster/fonos
 *
 * This file is part of Project Fonos
 *
 * Licensed under the MIT License (the "License");
 * you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 *
 *    https://opensource.org/licenses/MIT
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import {configExist} from "@fonos/certs";
import {getClientCredentials} from "./trust_util";
import {ServiceOptions} from "./types";
import * as fs from "fs";
import * as path from "path";
import {Metadata} from "@grpc/grpc-js";

const CONFIG_FILE =
  process.env.API_CONFIG_FILE ||
  path.join(require("os").homedir(), ".fonos", "config");
const getConfigFile = () => fs.readFileSync(CONFIG_FILE).toString().trim();

const defaultOptions: ServiceOptions = {
  endpoint: process.env.APISERVER_ENDPOINT || "api.fonoster.io",
  accessKeyId: process.env.ACCESS_KEY_ID,
  accessKeySecret: process.env.ACCESS_KEY_SECRET
};

export default class {
  ServiceClient: any;
  options: any;
  metadata: any;
  service: any;

  /**
   * Use the Options object to overwrite the service default configuration.
   * @typedef {Object} Options
   * @property {string} endpoint - The endpoint URI to send requests to.
   * The endpoint should be a string like '{serviceHost}:{servicePort}'.
   * @property {string} accessKeyId - your Fonos access key ID.
   * @property {string} accessKeySecret - your Fonos secret access key.
   * @property {string} bucket - The bucket to upload apps and media files.
   */

  /**
   * Constructs a service object.
   *
   * @param {Options} options - Overwrite for the service's defaults configuration.
   */
  constructor(ServiceClient: any, options: ServiceOptions) {
    this.ServiceClient = ServiceClient;
    this.options = options;
  }

  init(): void {
    try {
      if (!this.options && configExist()) {
        this.options = JSON.parse(getConfigFile());
      }
    } catch (err) {
      throw new Error(`Malformed config file found at: ${CONFIG_FILE}`);
    }

    if (!this.options) {
      this.options = defaultOptions;
    }

    if (!this.options.accessKeyId || !this.options.accessKeySecret) {
      throw new Error("Not valid credentials found");
    }

    this.metadata = new Metadata();
    this.metadata.add("access_key_id", this.options.accessKeyId);
    this.metadata.add("access_key_secret", this.options.accessKeySecret);

    this.service = new this.ServiceClient(
      this.options.endpoint || defaultOptions.endpoint,
      getClientCredentials()
    );
  }

  getOptions(): any {
    return this.options;
  }

  getService(): any {
    return this.service;
  }

  getMeta(): any {
    return this.metadata;
  }
}
