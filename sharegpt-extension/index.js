﻿let isRequesting = false;

function init() {
    const shareButton = createShareBtn();
    const selectButton = createSelectBtn();

    function appendShareButton() {
        const buttonsWrapper = document.querySelector(
            "#__next main form > div div:nth-of-type(1)"
        );

        buttonsWrapper.appendChild(shareButton);
    }

    function appendSelectButton() {
        const buttonsWrapper = document.querySelector(
            "#__next main form > div div:nth-of-type(1)"
        );

        buttonsWrapper.appendChild(selectButton);
    }

    appendSelectButton();

    appendShareButton();

    // re-append the share buttin whenever "#__next main" gets replaced
    const observer = new MutationObserver(function (mutations_list) {
        mutations_list.forEach(function (mutation) {
            if (mutation.addedNodes.length > 0) {
                appendSelectButton();
                appendShareButton();
            }
        });
    });

    observer.observe(document.querySelector("#__next"), {
        subtree: false,
        childList: true,
    });

    const textareaElement = document.querySelector("#__next main form textarea");

    const submitButton = textareaElement.nextElementSibling;

    document.body.addEventListener("keydown", (event) => {
        if (event.keyCode === 13) {
            showIfNotLoading(submitButton, shareButton, selectButton);
        }
    });

    submitButton.addEventListener("click", (event) => {
        showIfNotLoading(submitButton, shareButton, selectButton);
    });

    shareButton.addEventListener("click", async () => {
        if (isRequesting) return;
        isRequesting = true;
        shareButton.textContent = "Sharing...";
        shareButton.style.cursor = "initial";

        const threadContainer = document.getElementsByClassName(
            "flex flex-col items-center text-sm dark:bg-gray-800"
        )[0];

        // show the model for chatgpt+ users
        let model;

        const chatGptPlusElement = document.querySelector(".gold-new-button");
        const isNotChatGptPlus =
            chatGptPlusElement && chatGptPlusElement.innerText.includes("Upgrade");

        if (!isNotChatGptPlus) {
            const modelElement = threadContainer.firstChild;
            model = modelElement.innerText;
        }

        const conversationData = {
            avatarUrl: getAvatarImage(),
            model,
            items: [],
        };

        for (const node of threadContainer.children) {
            if (node.classList.contains('to-hide')) continue;
            
            const markdown = node.querySelector(".markdown");

            // tailwind class indicates human or gpt
            if ([...node.classList].includes("dark:bg-gray-800")) {
                const warning = node.querySelector(".text-orange-500");
                if (warning) {
                    conversationData.items.push({
                        from: "human",
                        value: warning.innerText.split("\n")[0],
                    });
                } else {
                    conversationData.items.push({
                        from: "human",
                        value: node.textContent,
                    });
                }
                // if it's a GPT response, it might contain code blocks
            } else if (markdown) {
                conversationData.items.push({
                    from: "gpt",
                    value: markdown.outerHTML,
                });
            }
        }

        const res = await fetch("https://sharegpt.com/api/conversations", {
            body: JSON.stringify(conversationData),
            headers: { "Content-Type": "application/json" },
            method: "POST",
        }).catch((err) => {
            isRequesting = false;
            alert(`Error saving conversation: ${err.message}`);
        });
        const { id } = await res.json();
        const url = `https://sharegpt.com/c/${id}`;

        window.open(url, "_blank");

        setTimeout(() => {
            shareButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3 h-3">
      <path stroke-linecap="round" stroke-linejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
    </svg>Share`;
            shareButton.style.cursor = "pointer";
            isRequesting = false;
        }, 1000);
    });


    selectButton.addEventListener("click", async () => {
        if (isRequesting) return;

        const threadContainer = document.getElementsByClassName(
            "flex flex-col items-center text-sm dark:bg-gray-800"
        )[0];
        
        for (const node of threadContainer.children) {
            const markdown = node.querySelector(".markdown");

            // tailwind class indicates human or gpt
            if ([...node.classList].includes("dark:bg-gray-800")) {
                node.classList.add('to-hide');
                node.addEventListener('click', (event) => {
                    if (node.classList.contains('to-hide')) {
                        node.classList.remove('to-hide');
                    }
                    else {
                        node.classList.add('to-hide');
                    }
                });
                // if it's a GPT response, it might contain code blocks
            } else if (markdown) {
                node.classList.add('to-hide');
                node.addEventListener('click', (event) => {
                    if (node.classList.contains('to-hide')) {
                        node.classList.remove('to-hide');
                    }
                    else {
                        node.classList.add('to-hide');
                    }
                });
            }
        }

        alert('Click on content you want to share');
    });
}

function showIfNotLoading(loadingElement, newElement, newElement2) {
    const timerId = setInterval(() => {
        if (loadingElement.disabled) {
            isLoading = true;
            newElement.style.display = "none";
            newElement2.style.display = "none";
        } else {
            isLoading = false;
            newElement.style.display = "flex";
            newElement2.style.display = "flex";
            clearInterval(timerId);
        }
    }, 100);
}

function getAvatarImage() {
    // Create a canvas element
    try {
        const canvas = document.createElement("canvas");

        const image = document.querySelectorAll("img")[1];

        // Set the canvas size to 30x30 pixels
        canvas.width = 30;
        canvas.height = 30;

        // Draw the img onto the canvas
        canvas.getContext("2d").drawImage(image, 0, 0);

        // Convert the canvas to a base64 string as a JPEG image
        const base64 = canvas.toDataURL("image/jpeg");

        return base64;
    } catch (error) {
        console.log("Error generating avatar image.");
        return null;
    }
}

function createShareBtn() {
    const button = document.createElement("button");

    button.classList.add("btn", "flex", "gap-2", "justify-center", "btn-neutral");

    button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3 h-3">
  <path stroke-linecap="round" stroke-linejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
</svg>Share`;

    return button;
}


function createSelectBtn() {
    const button = document.createElement("button");

    button.classList.add("btn", "flex", "gap-2", "justify-center", "btn-neutral");

    button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3 h-3">
  <path stroke-linecap="round" stroke-linejoin="round" d="M5 12l3 3 7-7" />
</svg>Choose Content`;

    return button;
}

init();
