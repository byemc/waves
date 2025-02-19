
const version = "5.0.0";

const writeVersion = (elementId) => {
    document.getElementById(elementId).innerText = version;
}

export { writeVersion, version };
