import fetch from 'isomorphic-unfetch';
import getConfig from 'next/config';

const { publicRuntimeConfig } = getConfig();

async function apiGetJson(url) {
  const response = await apiGet(url);
  return response.ok ? response.json() : {};
}

async function apiGet(url) {
  return fetch(toFullUrl(url));
}

async function apiPost(url, data) {
  return apiBody('POST', url, data);
}

async function apiPut(url, data) {
  return apiBody('PUT', url, data);
}

async function apiDelete(url, data) {
  return apiBody('DELETE', url, data);
}

async function apiBody(method, url, data) {
  return fetch(toFullUrl(url), {
    method,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
}

function toFullUrl(url) {
  return `${publicRuntimeConfig.HOST}/api${url}`;
}

export { apiGetJson, apiGet, apiPost, apiPut, apiDelete };
