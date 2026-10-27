
/* =========================================================
   GTLIPA EXPERIENCE
   A front-end concept prototype.
   All payment states are simulated. No real payment occurs.
   ========================================================= */

const $ = (id) => document.getElementById(id);

const roleSection = $("roleSection");
const phaseOne = $("phaseOne");
const phaseOneReveal = $("phaseOneReveal");
const phaseTwo = $("phaseTwo");
const phaseThree = $("phaseThree");

let selectedRole = "vendor";
let orderIndex = 0;
let phaseOneDone = false;
let phaseTwoStep = 0;
let cashTaskStarted = false;
let cashTaskCompleted = false;

const orders = [
  {
    number: "001",
    amount: "TZS 25,000",
    product: "Everyday essentials",
    description: "2 items · Order prepared",
    customer: "A customer is ready",
    avatar: "A",
    art: "▧"
  },
  {
    number: "002",
    amount: "TZS 18,000",
    product: "Household supplies",
    description: "3 items · Order prepared",
    customer: "Another customer is ready",
    avatar: "M",
    art: "◫"
  },
  {
    number: "003",
    amount: "TZS 12,000",
    product: "Personal care",
    description: "1 item · Order prepared",
    customer: "A third customer is ready",
    avatar: "S",
    art: "◈"
  }
];

/* =========================================================
   SHARED HELPERS
   ========================================================= */

function scrollToElement(element) {
  if (!element) return;

  element.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

function setTaskDone(taskId) {
  const task = $(taskId);

  if (task) {
    task.classList.add("done");
  }
}

function setHidden(elementId, shouldHide) {
  const element = $(elementId);

  if (!element) return;

  element.classList.toggle("hidden", shouldHide);
}

function renderOrder() {
  const order = orders[orderIndex];

  if (!order) return;

  // The updated HTML already contains "ORDER" outside this span.
  $("orderNumber").textContent = "#" + order.number;

  $("orderAmount").textContent = order.amount;
  $("productName").textContent = order.product;
  $("productDescription").textContent = order.description;
  $("customerName").textContent = order.customer;
  $("customerAvatar").textContent = order.avatar;
  $("productArt").textContent = order.art;

  $("phaseOneProgress").textContent =
    String(orderIndex + 1).padStart(2, "0") + " / 03 COMPLETE";

  $("orderStatus").textContent =
    orderIndex === 0 ? "READY" : "NEW ORDER";

  $("actionLabel").textContent =
    selectedRole === "customer"
      ? "Make payment"
      : "Receive payment";
}

/* =========================================================
   PHASE 01: CASH-HANDLING TASK
   ========================================================= */

function startFirstPayment() {
  if (phaseOneDone || cashTaskStarted) return;

  cashTaskStarted = true;

  // Reveal the cash transaction details.
  setHidden("cashTask", false);

  $("cashReceived").textContent = "TZS 30,000";
  $("changeDue").textContent = "TZS 5,000";

  $("phaseOneStatus").textContent =
    "Cash received · Change due";

  $("startPayment").disabled = true;

  $("startPayment").innerHTML =
    "<span>Cash received</span><span>✓</span>";

  setTaskDone("task1");

  // Bring the newly revealed task into view when necessary.
  scrollToElement($("cashTask"));
}

function completeCashTask() {
  if (phaseOneDone || !cashTaskStarted || cashTaskCompleted) {
    return;
  }

  cashTaskCompleted = true;

  // The first sale has now been completed.
  setTaskDone("task2");

  setHidden("cashTask", true);
  setHidden("shopQueue", false);

  $("phaseOneStatus").textContent =
    "Sale complete · Customers waiting";

  $("phaseOneDescription").textContent =
    "The first sale is complete. Two more customers are waiting, and the work continues.";

  setTaskDone("task3");

  // Orders #002 and #003 are now waiting.
  $("waitingCount").textContent = "2 waiting";
  $("queueCount").textContent = "2";

  setHidden("queueOrder1", true);
  setHidden("queueOrder2", false);
  setHidden("queueOrder3", false);

  $("queueMessage").textContent =
    "The first sale is complete. Two more customers are ready to be served.";

  $("nextCustomer").disabled = false;

  $("nextCustomer").innerHTML =
    "<span>Attend to next customer</span><span>→</span>";

  // Update the queue ticket strip.
  const strip = $("queueStrip");

  if (strip) {
    strip.innerHTML = "";

    orders.slice(1).forEach((order) => {
      const ticket = document.createElement("div");

      ticket.className = "queue-ticket waiting";

      const number = document.createElement("span");
      number.textContent = "ORDER #" + order.number;

      const status = document.createElement("strong");
      status.textContent = "Waiting for service";

      ticket.append(number, status);
      strip.appendChild(ticket);
    });
  }

  scrollToElement($("shopQueue"));
}

/* =========================================================
   PHASE 01: GROWING CUSTOMER QUEUE
   ========================================================= */

function moveToNextCustomer() {
  if (phaseOneDone || !cashTaskCompleted) return;

  // Once the final order has been reached, finish Phase 01.
  if (orderIndex >= orders.length - 1) {
    finishPhaseOne();
    return;
  }

  orderIndex++;

  renderOrder();

  const waiting = Math.max(
    0,
    orders.length - orderIndex - 1
  );

  $("waitingCount").textContent =
    waiting + (waiting === 1 ? " waiting" : " waiting");

  $("queueCount").textContent = String(waiting);

  $("phaseOneStatus").textContent =
    "Attending to order #" + orders[orderIndex].number;

  $("phaseOneDescription").textContent =
    "The previous sale is complete. Now attend to the next customer and keep the business moving.";

  $("queueMessage").textContent =
    waiting > 0
      ? "One customer is being attended to while another customer waits to be served."
      : "You are attending to the final order in the queue.";

  $("nextCustomer").innerHTML =
    orderIndex === orders.length - 1
      ? "<span>Complete Phase 01</span><span>→</span>"
      : "<span>Attend to next customer</span><span>→</span>";

  // Update which orders remain in the queue.
  setHidden("queueOrder1", true);
  setHidden("queueOrder2", orderIndex > 1);
  setHidden("queueOrder3", orderIndex > 2);

  // The order currently being attended to is no longer waiting.
  const currentQueueOrder = $("queueOrder" + (orderIndex + 1));

  if (currentQueueOrder) {
    currentQueueOrder.classList.remove("waiting");
    currentQueueOrder.classList.add("current");

    const status = currentQueueOrder.querySelector(
      ".shop-queue-order-side span"
    );

    if (status) {
      status.textContent = "In progress";
    }
  }

  // Keep the queue ticket strip in sync.
  const strip = $("queueStrip");

  if (strip) {
    strip.innerHTML = "";

    orders.slice(orderIndex + 1).forEach((order) => {
      const ticket = document.createElement("div");

      ticket.className = "queue-ticket waiting";

      const number = document.createElement("span");
      number.textContent = "ORDER #" + order.number;

      const status = document.createElement("strong");
      status.textContent = "Waiting for service";

      ticket.append(number, status);
      strip.appendChild(ticket);
    });
  }

  scrollToElement($("shop"));
}

function finishPhaseOne() {
  if (phaseOneDone) return;

  phaseOneDone = true;

  $("phaseOneStatus").textContent = "Phase complete";

  $("phaseOneDescription").textContent =
    "You have worked through the queue. Each order needed attention, time, and action to keep the business moving.";

  $("startPayment").disabled = true;
  $("completeChange").disabled = true;
  $("nextCustomer").disabled = true;

  $("phaseOneReflection").textContent =
    "The first sale was completed, but the work did not stop there. Other customers were waiting, and each new order demanded time and attention. This is the everyday business experience the campaign is exploring.";

  scrollToElement(phaseOneReveal);
}

/* =========================================================
   ROLE ENTRY
   ========================================================= */

$("enterExperience").addEventListener("click", () => {
  scrollToElement(roleSection);
});

function chooseRole(role) {
  selectedRole = role;

  if (role === "vendor") {
    $("roleLabel").textContent = "You are the vendor";

    $("phaseOneDescription").textContent =
      "Your shop is open. A customer has made a purchase. The order is ready. Now complete the sale.";
  } else {
    $("roleLabel").textContent = "You are the customer";

    $("phaseOneDescription").textContent =
      "You have chosen what you need. Your order is ready. You want to pay, complete your purchase, and get on with your day.";
  }

  renderOrder();

  // Do not assign startPayment.onclick here.
  // The single event listener below handles the button.

  scrollToElement(phaseOne);
}

$("chooseVendor").addEventListener("click", () => {
  chooseRole("vendor");
});

$("chooseCustomer").addEventListener("click", () => {
  chooseRole("customer");
});

/* =========================================================
   PHASE 01 BUTTON EVENTS
   ========================================================= */

$("startPayment").addEventListener(
  "click",
  startFirstPayment
);

$("completeChange").addEventListener(
  "click",
  completeCashTask
);

$("nextCustomer").addEventListener(
  "click",
  moveToNextCustomer
);

/* =========================================================
   PHASE 02: SAME TASK, DIFFERENT FLOW
   ========================================================= */

$("unlockPhaseTwo").addEventListener("click", () => {
  scrollToElement(phaseTwo);
});

const flowCopy = [
  {
    title: "Scan the QR.",
    description:
      "The customer scans the business QR code to begin the payment."
  },
  {
    title: "Payment initiated.",
    description:
      "The customer completes the payment on their device."
  },
  {
    title: "Notification received.",
    description:
      "The merchant receives a payment notification."
  },
  {
    title: "Confirm payment.",
    description:
      "The merchant confirms the payment before releasing the order."
  },
  {
    title: "Sale complete.",
    description:
      "The payment has been confirmed. The order can be released and the business can continue."
  }
];

function updateFlow(step) {
  for (let i = 1; i <= 5; i++) {
    const item = $("flow" + i);

    item.classList.remove("active", "complete");

    if (i - 1 < step) {
      item.classList.add("complete");
    }

    if (i - 1 === step) {
      item.classList.add("active");
    }
  }

  $("terminalStep").textContent =
    step >= 5
      ? "COMPLETE"
      : "STEP 0" + (step + 1);

  if (step >= 5) {
    $("terminalStatus").innerHTML =
      "<strong>Payment confirmed.</strong><br>" +
      "The order can now be released.";

    $("terminalAction").innerHTML =
      "<span>Meet GTLipa</span><span>→</span>";

    return;
  }

  $("terminalStatus").innerHTML =
    "<strong>" +
    flowCopy[step].title +
    "</strong><br>" +
    flowCopy[step].description;

  const labels = [
    "Scan and pay",
    "Complete payment",
    "Receive notification",
    "Confirm payment",
    "Complete order"
  ];

  $("terminalAction").innerHTML =
    "<span>" +
    labels[step] +
    "</span><span>→</span>";
}

$("terminalAction").addEventListener("click", () => {
  if (phaseTwoStep >= 5) {
    scrollToElement(phaseThree);
    return;
  }

  phaseTwoStep++;

  updateFlow(phaseTwoStep);

  if (phaseTwoStep === 5) {
    // The next click takes the visitor to the product reveal.
    return;
  }
});

updateFlow(0);

/* =========================================================
   RESTART
   ========================================================= */

$("restart").addEventListener("click", () => {
  window.location.reload();
});
