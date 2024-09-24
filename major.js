const fs = require("fs");
const axios = require("axios");
const colors = require("colors");
const { DateTime } = require("luxon");
const {
  Worker,
  isMainThread,
  parentPort,
  workerData,
} = require("worker_threads");
const path = require("path");

const maxThreads = 10; // Jumlah thread maksimum yang berjalan secara bersamaan

class GLaDOS {
  constructor() {
    this.authUrl = "https://major.glados.app/api/auth/tg/";
    this.userInfoUrl = "https://major.glados.app/api/users/";
    this.streakUrl = "https://major.glados.app/api/user-visits/streak/";
    this.visitUrl = "https://major.glados.app/api/user-visits/visit/";
    this.rouletteUrl = "https://major.glados.app/api/roulette/";
    this.holdCoinsUrl = "https://major.glados.app/api/bonuses/coins/";
    this.tasksUrl = "https://major.glados.app/api/tasks/";
    this.swipeCoinUrl = "https://major.glados.app/api/swipe_coin/";
    this.durovUrl = "https://major.bot/api/durov/";
    this.durovPayloadUrl =
      "https://raw.githubusercontent.com/dancayairdrop/blum/main/durov.json";
    this.accountIndex = 0;
  }

  headers(token = null) {
    const headers = {
      Accept: "application/json, text/plain, */*",
      "Accept-Encoding": "gzip, deflate, br",
      "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
      "Content-Type": "application/json",
      Origin: "https://major.glados.app/reward",
      Referer: "https://major.glados.app/",
      "Sec-Ch-Ua":
        '"Not/A)Brand";v="99", "Google Chrome";v="115", "Chromium";v="115"',
      "Sec-Ch-Ua-Mobile": "?0",
      "Sec-Ch-Ua-Platform": '"Windows"',
      "Sec-Fetch-Dest": "empty",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Site": "same-origin",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return headers;
  }

  async randomDelay() {
    const delay = Math.floor(Math.random() * (1000 - 500 + 1)) + 500; // Random delay antara 500ms dan 1000ms
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  async log(msg, type = "info") {
    const timestamp = new Date().toLocaleTimeString();
    const accountPrefix = `[Akun ${this.accountIndex + 1}]`;
    let logMessage = "";

    switch (type) {
      case "success":
        logMessage = `${accountPrefix} ${msg}`.green;
        break;
      case "error":
        logMessage = `${accountPrefix} ${msg}`.red;
        break;
      case "warning":
        logMessage = `${accountPrefix} ${msg}`.yellow;
        break;
      default:
        logMessage = `${accountPrefix} ${msg}`.blue;
    }

    console.log(`${timestamp} ${logMessage}`);
    await this.randomDelay();
  }

  async waitWithCountdown(seconds) {
    for (let i = seconds; i >= 0; i--) {
      process.stdout.write(`\r[*] Menunggu ${i} detik untuk melanjutkan...`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    console.log("");
  }

  async makeRequest(method, url, data = null, token = null) {
    const headers = this.headers(token);
    const config = {
      method,
      url,
      headers,
    };

    if (data) {
      config.data = data;
    }

    try {
      const response = await axios(config);
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        return error.response.data;
      }
      throw error;
    }
  }

  async authenticate(init_data) {
    const payload = { init_data };
    return this.makeRequest("post", this.authUrl, payload, null);
  }

  async getUserInfo(userId, token) {
    return this.makeRequest(
      "get",
      `${this.userInfoUrl}${userId}/`,
      null,
      token,
    );
  }

  async getStreak(token) {
    return this.makeRequest("get", this.streakUrl, null, token);
  }

  async postVisit(token) {
    return this.makeRequest("post", this.visitUrl, {}, token);
  }

  async spinRoulette(token) {
    return this.makeRequest("post", this.rouletteUrl, {}, token);
  }

  async holdCoins(token) {
    const coins = Math.floor(Math.random() * (950 - 900 + 1)) + 900;
    const payload = { coins };
    const result = await this.makeRequest(
      "post",
      this.holdCoinsUrl,
      payload,
      token,
    );
    if (result.success) {
      await this.log(
        `HOLD coin berhasil, menerima ${coins} bintang`,
        "success",
      );
    } else if (result.detail && result.detail.blocked_until) {
      const blockedTime = DateTime.fromSeconds(result.detail.blocked_until)
        .setZone("system")
        .toLocaleString(DateTime.DATETIME_MED);
      await this.log(
        `HOLD coin tidak berhasil, perlu mengundang ${result.detail.need_invites} teman atau menunggu sampai ${blockedTime}`,
        "warning",
      );
    } else {
      await this.log(`HOLD coin tidak berhasil`, "error");
    }
    return result;
  }

  async swipeCoin(token) {
    const getResponse = await this.makeRequest(
      "get",
      this.swipeCoinUrl,
      null,
      token,
    );
    if (getResponse.success) {
      const coins = Math.floor(Math.random() * (1300 - 1000 + 1)) + 1000;
      const payload = { coins };
      const result = await this.makeRequest(
        "post",
        this.swipeCoinUrl,
        payload,
        token,
      );
      if (result.success) {
        await this.log(
          `Swipe coin berhasil, menerima ${coins} bintang`,
          "success",
        );
      } else {
        await this.log(`Swipe coin tidak berhasil`, "error");
      }
      return result;
    } else if (getResponse.detail && getResponse.detail.blocked_until) {
      const blockedTime = DateTime.fromSeconds(getResponse.detail.blocked_until)
        .setZone("system")
        .toLocaleString(DateTime.DATETIME_MED);
      await this.log(
        `Swipe coin tidak berhasil, perlu mengundang ${getResponse.detail.need_invites} teman atau menunggu sampai ${blockedTime}`,
        "warning",
      );
    } else {
      await this.log(`Tidak dapat mendapatkan informasi swipe coin`, "error");
    }
    return getResponse;
  }

  async getDailyTasks(token) {
    const tasks = await this.makeRequest(
      "get",
      `${this.tasksUrl}?is_daily=false`,
      null,
      token,
    );
    if (Array.isArray(tasks)) {
      return tasks.map((task) => ({ id: task.id, title: task.title }));
    } else {
      return null;
    }
  }

  async completeTask(token, task) {
    const payload = { task_id: task.id };
    const result = await this.makeRequest(
      "post",
      this.tasksUrl,
      payload,
      token,
    );
    if (result.is_completed) {
      await this.log(
        `Menyelesaikan tugas ${task.id}: ${task.title} .. status: berhasil`,
        "success",
      );
    }
    return result;
  }

  async sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async getDurovPayload() {
    try {
      const response = await axios.get(this.durovPayloadUrl);
      return response.data;
    } catch (error) {
      return null;
    }
  }

  async handleDurovTask(token) {
    try {
      const getResult = await this.makeRequest(
        "get",
        this.durovUrl,
        null,
        token,
      );

      if (getResult.detail && getResult.detail.blocked_until) {
        const blockedTime = DateTime.fromSeconds(getResult.detail.blocked_until)
          .setZone("system")
          .toLocaleString(DateTime.DATETIME_MED);
        await this.log(
          `Menemukan teka-teki Durov tidak berhasil, perlu mengundang ${getResult.detail.need_invites} teman atau menunggu sampai ${blockedTime}`,
          "warning",
        );
        return;
      }

      if (!getResult.success) {
        return;
      }

      const payloadData = await this.getDurovPayload();
      if (!payloadData) {
        return;
      }

      const today = DateTime.now().setZone("system");
      const payloadDate = DateTime.fromFormat(payloadData.date, "dd/MM/yyyy");

      if (today.hasSame(payloadDate, "day")) {
        const payload = payloadData.tasks[0];
        const postResult = await this.makeRequest(
          "post",
          this.durovUrl,
          payload,
          token,
        );

        if (
          postResult.correct &&
          JSON.stringify(postResult.correct) ===
            JSON.stringify(Object.values(payload))
        ) {
          await this.log("Menemukan teka-teki Durov berhasil", "success");
        } else {
          await this.log("Menemukan teka-teki Durov tidak berhasil", "error");
        }
      } else if (today > payloadDate) {
        await this.log(
          "Belum ada combo Durov hari baru, perlu memanggil @troublescope untuk memperbarui combo",
          "warning",
        );
      } else {
        await this.log(
          "Payload date is in the future. Please check the date format.",
          "warning",
        );
      }
    } catch (error) {
      await this.log(`Error: ${error.message}`, "error");
    }
  }

  async processAccount(accountData) {
    const { init_data, index } = accountData;
    this.accountIndex = index;

    try {
      const authResult = await this.authenticate(init_data);
      if (authResult) {
        const { access_token, user } = authResult;
        const { id, first_name } = user;

        await this.log(`Akun ${first_name}`, "info");

        const userInfo = await this.getUserInfo(id, access_token);
        if (userInfo) {
          await this.log(
            `Jumlah bintang yang dimiliki: ${userInfo.rating}`,
            "success",
          );
        }

        const streakInfo = await this.getStreak(access_token);
        if (streakInfo) {
          await this.log(`Sudah absen ${streakInfo.streak} hari!`, "success");
        }

        const visitResult = await this.postVisit(access_token);
        if (visitResult) {
          if (visitResult.is_increased) {
            await this.log(
              `Absen berhasil hari ${visitResult.streak}`,
              "success",
            );
          } else {
            await this.log(
              `Sudah absen sebelumnya. Streak saat ini: ${visitResult.streak}`,
              "warning",
            );
          }
        }

        const rouletteResult = await this.spinRoulette(access_token);
        if (rouletteResult) {
          if (rouletteResult.rating_award > 0) {
            await this.log(
              `Spin berhasil, menerima ${rouletteResult.rating_award} bintang`,
              "success",
            );
          } else if (
            rouletteResult.detail &&
            rouletteResult.detail.blocked_until
          ) {
            const blockedTime = DateTime.fromSeconds(
              rouletteResult.detail.blocked_until,
            )
              .setZone("system")
              .toLocaleString(DateTime.DATETIME_MED);
            await this.log(
              `Spin tidak berhasil, perlu mengundang ${rouletteResult.detail.need_invites} teman atau menunggu sampai ${blockedTime}`,
              "warning",
            );
          } else {
            await this.log(`Hasil spin tidak terdefinisi`, "error");
          }
        }

        await this.sleep(2000);
        await this.handleDurovTask(access_token);
        await this.log(`Before run hold coin task lets sleep first.`);
        await this.sleep(60000);
        await this.holdCoins(access_token);
        await this.log(`Before run swipe coin lets sleep first`);
        await this.sleep(60000);
        await this.swipeCoin(access_token);
        await this.sleep(1000);

        const tasks = await this.getDailyTasks(access_token);
        if (tasks) {
          for (const task of tasks) {
            await this.completeTask(access_token, task);
            await this.sleep(1000);
          }
        }
      } else {
        await this.log(`Tidak dapat membaca data akun`, "error");
      }
    } catch (error) {
      await this.log(`Error saat memproses akun: ${error.message}`, "error");
    }
  }

  async processBatch(batch) {
    return Promise.all(
      batch.map((account, index) => {
        return new Promise((resolve) => {
          const worker = new Worker(__filename, {
            workerData: { account, index: account.index },
          });

          const timeout = setTimeout(
            () => {
              worker.terminate();
              this.log(
                `Akun ${account.index + 1} timeout setelah 10 menit`,
                "error",
              );
              resolve();
            },
            10 * 60 * 1000,
          );

          worker.on("message", (message) => {
            if (message === "done") {
              clearTimeout(timeout);
              resolve();
            }
          });

          worker.on("error", (error) => {
            this.log(
              `Error thread untuk akun ${account.index + 1}: ${error.message}`,
              "error",
            );
            clearTimeout(timeout);
            resolve();
          });

          worker.on("exit", (code) => {
            if (code !== 0) {
              this.log(
                `Thread akun ${account.index + 1} berhenti dengan kode error ${code}`,
                "error",
              );
            }
            clearTimeout(timeout);
            resolve();
          });
        });
      }),
    );
  }

  async main() {
    const dataFile = "data.txt";
    const data = fs
      .readFileSync(dataFile, "utf8")
      .split("\n")
      .filter(Boolean)
      .map((line, index) => ({ init_data: line.trim(), index }));

    if (data.length === 0) {
      await console.log(`[*] Tidak ada akun yang tersedia. Menutup program...`);
      process.exit(0);
    }

    while (true) {
      for (let i = 0; i < data.length; i += maxThreads) {
        const batch = data.slice(i, i + maxThreads);
        await this.processBatch(batch);

        if (i + maxThreads < data.length) {
          await this.log(
            "Menunggu 3 detik sebelum memproses thread berikutnya...",
            "warning",
          );
          await this.sleep(3000);
        }
      }

      await console.log(
        `[*] Sudah memproses semua akun. Istirahat ${28850} detik sebelum memulai lagi...`,
      );
      await this.waitWithCountdown(28850);
    }
  }
}

if (isMainThread) {
  const glados = new GLaDOS();
  glados.main().catch(async (err) => {
    await glados.log(`Error: ${err.message}`, "error");
    process.exit(1);
  });
} else {
  const glados = new GLaDOS();
  glados
    .processAccount(workerData.account)
    .then(() => {
      parentPort.postMessage("done");
    })
    .catch(async (error) => {
      await glados.log(`Thread error: ${error.message}`, "error");
      parentPort.postMessage("done");
    });
}
