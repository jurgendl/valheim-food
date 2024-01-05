document.addEventListener("DOMContentLoaded", () => {
    {
        // Create a style element
        var styleElement = document.createElement("style");
        // Define the CSS rules
        var cssRules = `
			#darkmode-toggle-container {
				position: fixed;
				top: 1px;
				right: 21px;
				z-index: 9999;
			}
			#darkmode-toggle {
				display: inline-block;
				cursor: pointer;
			}
			body[data-bs-theme="dark"] #darkmode-toggle #light,
			body:not([data-bs-theme="dark"]) #darkmode-toggle #dark {
				display: none;
			}
			#light {
                color: #ffea3d;
                text-shadow: 0 0 3px #B90000D4, 0 0 3px #12122899;
            }
            #dark {
                color: #8a6f6f;
                text-shadow: 0 0 3px #FFE8E8, 0 0 5px #EFEFFF;
            }
		`;
        // Set the CSS rules for the style element
        styleElement.innerHTML = cssRules;
        // Append the style element to the head of the document
        document.head.appendChild(styleElement);
    }

    {
        // Create container element
        var containerElement = document.createElement("div");
        containerElement.id = "darkmode-toggle-container";
        // Create toggle element
        var toggleElement = document.createElement("div");
        toggleElement.id = "darkmode-toggle";
        // Create light icon element
        var lightIconElement = document.createElement("div");
        lightIconElement.id = "light";
        lightIconElement.className = "fa-solid fa-sun";
        // Create dark icon element
        var darkIconElement = document.createElement("div");
        darkIconElement.id = "dark";
        darkIconElement.className = "fa-regular fa-moon";
        // Append elements to form the structure
        toggleElement.appendChild(lightIconElement);
        toggleElement.appendChild(darkIconElement);
        containerElement.appendChild(toggleElement);
        // Append the container element to the body
        document.body.appendChild(containerElement);
    }

    function setDarkMode(isDarkMode) {
        document.body.dataset.bsTheme = isDarkMode ? 'dark' : 'light';
        localStorage.setItem("dark-mode", isDarkMode);
        if (typeof changeDarkMode === 'function') changeDarkMode(isDarkMode);
    }
    function isDarkMode() {
        return localStorage.getItem("dark-mode") == "true";
    }

    document.getElementById("darkmode-toggle").addEventListener("click", () => {
        setDarkMode(!isDarkMode());
    });

    setDarkMode(isDarkMode());
});