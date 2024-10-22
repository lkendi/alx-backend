export default function createPushNotificationsJobs(jobs, queue) {
  if (!Array.isArray(jobs)) {
    throw new Error("Jobs is not an array");
  }

  jobs.forEach((job) => {
    const jobData = queue.create("push_notification_code_3", job);

    jobData
      .on("complete", () => {
        console.log(`Notification job ${jobData.id} completed`);
      })
      .on("failed", (error) => {
        console.log(`Notification job ${jobData.id} failed: ${error}`);
      })
      .on("progress", (progress) => {
        console.log(`Notification job ${jobData.id} ${progress}% complete`);
      });

    jobData.save((err) => {
      if (err) {
        console.error("Job creation failed:", err);
      } else {
        console.log(`Notification job created: ${jobData.id}`);
      }
    });
  });
}
