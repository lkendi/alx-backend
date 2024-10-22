import kue from "kue";
import { expect } from "chai";
import createPushNotificationsJobs from "./8-job.js";

const queue = kue.createQueue();

describe("createPushNotificationsJobs", () => {
  beforeEach(() => {
    queue.testMode.enter();
  });

  afterEach(() => {
    queue.testMode.exit();
    queue.testMode.clear();
  });

  it("should display an error message if jobs is not an array", () => {
    const fn = () => createPushNotificationsJobs({}, queue);
    expect(fn).to.throw("Jobs is not an array");
  });

  it("should create two new jobs in the queue", () => {
    const jobs = [
      {
        phoneNumber: "4153518780",
        message: "This is the code 1234 to verify your account",
      },
      {
        phoneNumber: "4153518781",
        message: "This is the code 5678 to verify your account",
      },
    ];

    createPushNotificationsJobs(jobs, queue);

    const jobCount = queue.testMode.jobs.length;
    expect(jobCount).to.equal(2);
    expect(queue.testMode.jobs[0].data).to.deep.equal(jobs[0]);
    expect(queue.testMode.jobs[1].data).to.deep.equal(jobs[1]);
  });

  it("should create a job with the correct phone number and message", () => {
    const job = [
      {
        phoneNumber: "4153518782",
        message: "This is the code 9012 to verify your account",
      },
    ];

    createPushNotificationsJobs(job, queue);

    const createdJob = queue.testMode.jobs[0].data;
    expect(createdJob.phoneNumber).to.equal("4153518782");
    expect(createdJob.message).to.equal(
      "This is the code 9012 to verify your account"
    );
  });
});
