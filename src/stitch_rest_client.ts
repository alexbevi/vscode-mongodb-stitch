import * as vscode from 'vscode';

const STITCH_API_BASE_URL = "https://stitch.mongodb.com/api/admin/v3.0";
const Client = require('node-rest-client').Client;
const client = new Client();

export class StitchRestClient {
  constructor() { }

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
  async authorize(payload: any = null): Promise<any> {
    return new Promise((resolve, reject) => {
      if (payload === null) {
        client.post(STITCH_API_BASE_URL + "/auth/providers/mongodb-cloud/login",
          this.getRequestArgs(), function(data: any, response: any) {
            if (response.statusCode === 200) {
              return resolve(data);
            } else {
              return reject(data.error);
            }
        });
      }
    });
  }

  async getFunctions(payload: any): Promise<any> {
    var projectId = vscode.workspace.getConfiguration('mongodb').get("atlas.project_id");
    var appId = vscode.workspace.getConfiguration('mongodb').get("stitch.app_id");

    const url = "/groups/" + projectId + "/apps/" + appId + "/functions";

    return new Promise((resolve, reject) => {
      client.get(STITCH_API_BASE_URL + url,
        this.getRequestArgsAuthorized(payload), function(data: any, response: any) {
          if (response.statusCode === 200) {
            return resolve(data);
          } else {
            return reject(data.error);
          }
      });
    });
  }
}