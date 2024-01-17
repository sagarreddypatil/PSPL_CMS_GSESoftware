#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <sys/time.h>
#include <time.h>
#include <unistd.h>

#include <arpa/inet.h>
#include <netinet/in.h>
#include <string.h>
#include <sys/socket.h>

#include <signal.h>

typedef uint16_t u16;
typedef uint64_t u64;
typedef int64_t i64;

#pragma pack(4)
typedef struct {
  char header[4];
  uint16_t sensor_id;
  uint64_t timestamp;
  uint64_t counter;
  int64_t data;
} sensornet_packet_t;

#pragma pack()

double random_uniform() {
  static bool init = false;
  if (!init) {
    srand(time(NULL));
    init = true;
  }
  return (double)rand() / (double)RAND_MAX;
}

const i64 get_time() {
  struct timeval time;
  gettimeofday(&time, NULL);

  return time.tv_sec * (int)1e6 + time.tv_usec;
}

int main() {
  const char *host = "127.0.0.1";
  const int port = 3746;

  int sock = socket(AF_INET, SOCK_DGRAM, 0);
  if (sock < 0) {
    perror("Failed to create socket");
    return 1;
  }

  struct sockaddr_in server;
  memset(&server, 0, sizeof(server));
  server.sin_family = AF_INET;
  server.sin_port = htons(port);

  int ids[] = {1,  2,  3,  4,  5,  6,  7,  8,  9,  10,
               11, 12, 13, 14, 15, 16, 17, 18, 19, 20};
  int num_ids = sizeof(ids) / sizeof(ids[0]);
  int counters[num_ids];
  double datas[num_ids];
  for (int i = 0; i < num_ids; i++) {
    counters[i] = 0;
    datas[i] = 0;
  }

  double rate = 1000; // Hz
  u64 last = get_time();

  while (1) {
    const u64 timestamp = get_time();
    for (int i = 0; i < num_ids; i++) {
      if (i == 0)
        continue;

      counters[i] += 1;
      datas[i] += random_uniform() * 2 - 1;
      sensornet_packet_t packet = {
          .header = "SEN",
          .sensor_id = ids[i],
          .timestamp = timestamp,
          .counter = counters[i],
          .data = (i64)datas[i],
      };

      ssize_t sent = sendto(sock, (const void *)&packet, sizeof(packet), 0,
                            (struct sockaddr *)&server, sizeof(server));
      if (sent < 0) {
        perror("Failed to send packet");
        return 1;
      }
    }

    u64 diff = get_time() - last;
    const i64 sleepVal = (i64)(1e6 / rate) - diff;
    if (sleepVal > 0) {
      usleep(sleepVal);
    }
    diff = get_time() - last;
    // printf("Rate: %f Hz\n", 1e6 / diff);
    last = get_time();
  }
}