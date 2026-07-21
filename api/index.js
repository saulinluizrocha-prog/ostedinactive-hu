const https = require('https');
const http = require('http');
const crypto = require('crypto');
const url = require('url');

const CONFIG = {
  api_key: 'c66289394c2a6e8515c8e8b382fba719',
  offer_id: '12277',
  user_id: '75329',
  api_domain: 'https://t-api.org',
};

function checkSum(jsonData) {
  return crypto.createHash('sha1').update(jsonData + CONFIG.api_key).digest('hex');
}

function makeRequest(payload, model, method) {
  return new Promise((resolve, reject) => {
    const wrapper = {
      user_id: CONFIG.user_id,
      data: payload,
    };

    const jsonData = JSON.stringify(wrapper);
    const sum = checkSum(jsonData);
    const apiUrl = `${CONFIG.api_domain}/api/${model}/${method}?check_sum=${sum}`;

    const parsedUrl = new url.URL(apiUrl);
    const isHttps = parsedUrl.protocol === 'https:';
    const transport = isHttps ? https : http;

    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (isHttps ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(jsonData),
      },
      rejectUnauthorized: false,
    };

    const req = transport.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (parsed.status === 'ok') {
            resolve(parsed.data);
          } else {
            reject(new Error(parsed.error || 'Unknown error'));
          }
        } catch (e) {
          reject(new Error('JSON parse error: ' + body));
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.setTimeout(30000, () => {
      req.abort();
      reject(new Error('Request timeout'));
    });

    req.write(jsonData);
    req.end();
  });
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try {
        // Try JSON first
        if (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
          resolve(JSON.parse(body));
        } else {
          // Parse URL-encoded form data
          const params = new url.URLSearchParams(body);
          const obj = {};
          params.forEach((v, k) => (obj[k] = v));
          resolve(obj);
        }
      } catch (e) {
        resolve({});
      }
    });
    req.on('error', reject);
  });
}

module.exports = async (req, res) => {
  // Allow CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const postData = await parseBody(req);
  const query = req.query || {};

  if (!postData.name || !postData.phone) {
    res.status(400).json({ error: 'Name and phone are required' });
    return;
  }

  const referer = query.referer || req.headers['referer'] || null;

  const leadData = {
    name: (postData.name || '').trim(),
    phone: (postData.phone || '').trim(),
    offer_id: CONFIG.offer_id,
    country: (postData.country || 'RO').trim(),
    region: postData.region || null,
    city: postData.city || null,
    count: postData.count || null,
    stream_id: '',
    tz: '',
    address: postData.address || null,
    email: postData.email || null,
    zip: postData.zip || null,
    user_comment: postData.user_comment || null,
    referer: referer,
    utm_source: query.utm_source || null,
    utm_medium: query.utm_medium || null,
    utm_campaign: query.utm_campaign || null,
    utm_term: query.utm_term || null,
    utm_content: query.utm_content || null,
    sub_id: query.sub_id || null,
    sub_id_1: query.sub_id_1 || null,
    sub_id_2: query.sub_id_2 || null,
    sub_id_3: query.sub_id_3 || null,
    sub_id_4: query.sub_id_4 || null,
  };

  // Remove null values
  Object.keys(leadData).forEach((k) => {
    if (leadData[k] === null || leadData[k] === '') delete leadData[k];
  });

  try {
    const lead = await makeRequest(leadData, 'lead', 'create');
    // Redirect to success page
    const successUrl = `/success.html?id=${lead.id}`;
    res.setHeader('Location', successUrl);
    res.status(302).end();
  } catch (err) {
    console.error('API Error:', err.message);
    res.status(500).json({ error: err.message });
  }
};
