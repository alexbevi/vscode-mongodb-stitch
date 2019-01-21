import * as vscode from 'vscode';

const STITCH_API_BASE_URL = "https://stitch.mongodb.com/api/admin/v3.0";
const Client = require('node-rest-client').Client;
const client = new Client();

export class StitchRestClient {
  constructor() {
    this._authPayload = {};
  }

  private _authPayload: object;

  // FIXME initialized _authPayload to {}, but need a way to check
  // if it's been assigned and {} === {} won't work
  private isEmpty(obj: object): boolean {
    for(var key in obj) {
        if(obj.hasOwnProperty(key)) {
          return false;
        }
    }
    return true;
  }

  /**
   * Create the request arguments sent to the Authorization API used
   * to generate access tokens
   *
   * @returns a request object
   */
  private getRequestArgs() {
    var username = vscode.workspace.getConfiguration('mongodb').get("atlas.username");
    var apiKey = vscode.workspace.getConfiguration('mongodb').get("atlas.api_key");

    return {
      data: {
        'username': username,
        'apiKey': apiKey
      },
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };
  }

  private getRequestArgsAuthorized(token: any) {
    return {
      headers: {
        'Authorization': 'Bearer ' + token.access_token
      }
    };
  }

  /**
   * Authorize a request to the Stitch Admin API.
   *
   * If no payload is provided, authorize and return an access/refresh token.
   * If a payload is provided, attempt to refresh (using refresh token)
   *
   * @returns an access token object
   */
  async authorize(): Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.isEmpty(this._authPayload)) {
        var self = this;
        client.post(STITCH_API_BASE_URL + "/auth/providers/mongodb-cloud/login",
          this.getRequestArgs(), function(data: any, response: any) {
            if (response.statusCode === 200) {
              self._authPayload = data;
              return resolve(data);
            } else {
              return reject(data.error);
            }
        });
      }
    });
  }

  private getFunctionsBaseUrl(): string {
    var projectId = vscode.workspace.getConfiguration('mongodb').get("atlas.project_id");
    var appId = vscode.workspace.getConfiguration('mongodb').get("stitch.app_id");

    return STITCH_API_BASE_URL + "/groups/" + projectId + "/apps/" + appId + "/functions";
  }

  async getFunctions(): Promise<any> {
   return new Promise((resolve, reject) => {
      client.get(this.getFunctionsBaseUrl(),
        this.getRequestArgsAuthorized(this._authPayload), function(data: any, response: any) {
          if (response.statusCode === 200) {
            return resolve(data);
          } else {
            return reject(data.error);
          }
      });
    });
  }

  async getFunction(functionId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      client.get(`${this.getFunctionsBaseUrl()}/${functionId}`,
        this.getRequestArgsAuthorized(this._authPayload), function(data: any, response: any) {
          if (response.statusCode === 200) {
            return resolve(data);
          } else {
            return reject(data.error);
          }
      });
    });
  }
}