const POP3Client = require("poplib");

const EMAIL = 'hashaam.ejaz@dubizzlelabs.com';
const PASSWORD = 'umtlzfltfzslzvbg';
const PORT = 995;
const HOST = '74.125.130.109'; // One of Gmail’s POP3 IPs


const client = new POP3Client(PORT, HOST, {
  tlserrs: false,
  enabletls: true,
  debug: false,
  ignoretlserrs: true,
});

client.on("error", function (err) {
  console.error("Connection error:", err);
});

client.on("connect", function () {
  console.log("✅ Connected to Gmail POP3");
  client.login(EMAIL, PASSWORD);
});

client.on("login", function (status, rawdata) {
  if (status) {
    console.log("🔐 Logged in");
    client.stat();
  } else {
    console.log("❌ Login failed");
    client.quit();
  }
});

client.on("stat", function (status, data) {
  if (status && data.count > 0) {
    console.log(`📧 You have ${data.count} emails`);
    client.retr(data.count); // fetch latest email
  } else {
    console.log("📭 No messages found");
    client.quit();
  }
});

client.on("retr", function (status, msgnumber, data, rawdata) {
  if (!status) {
    console.log(`❌ Failed to retrieve message #${msgnumber}`);
    client.quit();
    return;
  }

  console.log(`📨 Email #${msgnumber} fetched, parsing...`);

  // Manual parsing:
  const lines = data.split('\n');
  let from = '';
  let subject = '';
  let body = '';
  let inBody = false;

  for (let line of lines) {
    if (line.startsWith('From:')) {
      from = line.replace('From: ', '').trim();
    } else if (line.startsWith('Subject:')) {
      subject = line.replace('Subject: ', '').trim();
    } else if (line.trim() === '') {
      // Empty line signals end of headers, start of body
      inBody = true;
    } else if (inBody) {
      body += line + '\n';
    }
  }

  console.log("\n📬 Parsed Email:");
  console.log("From:", from);
  console.log("Subject:", subject);
  console.log("Body:\n" + body.trim());

  client.quit();
});

client.on("quit", function (status, rawdata) {
  console.log("🚪 Disconnected from server");
});
