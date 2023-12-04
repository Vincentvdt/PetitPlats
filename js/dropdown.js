class Dropdown {
    constructor(dropdownElement, options) {
        this.dropdown = dropdownElement
        this.initialOptions = options
        this.optionElements = []
        this.displayedOptions = []

        this.type = this.dropdown.id
        this.value = null

        this.btn = this.dropdown.querySelector(".select-btn")
        this.input = this.dropdown.querySelector("input")
        this.optionsContainer = this.dropdown.querySelector(".options-wrapper")
        this.resetBtn = this.dropdown.querySelector(".reset-icon")
    }

    init() {
        this.updateDisplayedOptions(this.initialOptions)
        this.focusableInsideElements = this.dropdown.querySelectorAll("*[tabindex='-1']:not(.options-wrapper):not(.option-item)")
        this.focusableOutsideElements = this.getFocusableElementsOutsideDropdown()

        if (this.input.value) {
            this.resetBtn.style.display = "block"
            let isHidden = this.resetBtn.style.display === "block" ? "false" : "true"
            this.resetBtn.setAttribute("aria-hidden", isHidden)
        }
        this.setEventListener()
    }

    setEventListener() {
        this.btn.addEventListener("click", this.toggle.bind(this))
        this.resetBtn.addEventListener("click", this.reset.bind(this))
        this.input.addEventListener("input", e => {
            e.preventDefault()
            const value = this.input.value
            this.resetBtn.style.display = value ? "block" : "none"
            let hidden = this.resetBtn.style.display === "block" ? "false" : "true"
            this.resetBtn.setAttribute("aria-hidden", hidden)
        })
    }

    createOptionsList(newOptions) {
        const options = newOptions.slice().sort() // Create a copy of the array to avoid modifying the original
        const fragment = document.createDocumentFragment()

        options.forEach(option => fragment.appendChild(this.createOptionDOM(option)))

        return fragment
    }

    createOptionDOM(option) {
        let value = option.trim()
        let link = document.createElement("a")
        link.className = "option-item"
        link.dataset.value = option.toLowerCase()
        link.setAttribute("role", "menuitem")
        link.setAttribute("tabindex", "-1")
        link.textContent = capitalize(value)
        link.href = "#"
        return link
    }

    getFocusableElementsOutsideDropdown() {
        const focusableElements = document.querySelectorAll("a[href], button, input, select, textarea, [tabindex]:not([tabindex=\"-1\"])")
        return Array.from(focusableElements).filter(element => !this.dropdown.contains(element))
    }

    toggle() {
        this.dropdown.dataset.toggle === "collapse" ? this.open() : this.close()
    }

    updateDisplayedOptions(newOptions) {
        let updatedOptionsList = this.createOptionsList(newOptions)
        this.optionsContainer.innerHTML = ""
        this.optionsContainer.appendChild(updatedOptionsList)
        this.optionElements = this.dropdown.querySelectorAll(".option-item")

        if (this.optionElements.length === 0) {
            const noResultsElement = document.createElement("p")
            noResultsElement.textContent = "No results found"
            noResultsElement.className = "no-options-found"
            this.optionsContainer.innerHTML = ""
            this.optionsContainer.appendChild(noResultsElement)
        }
    }

    searchOnChange({target: {value}}) {
        const searchTerm = value.toLowerCase().trim()

        const newOptions = (searchTerm.length >= 3)
            ? Array.from(this.displayedOptions)
                .filter(option => option.dataset.value.toLowerCase().trim().includes(searchTerm))
                .map(option => capitalize(option.dataset.value))
            : Array.from(this.displayedOptions)
                .map(option => capitalize(option.dataset.value))

        this.updateDisplayedOptions(newOptions)
    }

    handleClick(e) {
        e.preventDefault()
        // Click outside the dropdown
        if (!this.dropdown.contains(e.target)) {
            this.close()
            return
        }

        // Select an option
        if (Array.from(this.optionElements).includes(e.target)) {
            if (e.target.style.display === "none") {
                return
            }
            const clickedOption = Array.from(this.optionElements).find(option => option === e.target)
            if (clickedOption) {
                this.createTag(this.type, clickedOption.dataset.value)
                this.close()
                this.reset()
            }
        }
    }

    createTag(type, value) {
        tags.push({
            name: value,
            type
        })
        updateTags()
    }

    arrowNavigation(direction) {
        const displayedOptionsArray = Array.from(this.displayedOptions)
        let selectedIndex = displayedOptionsArray.indexOf(document.activeElement)

        if (direction === "ArrowDown") {
            selectedIndex = (selectedIndex + 1) % displayedOptionsArray.length
        } else if (direction === "ArrowUp") {
            selectedIndex = (selectedIndex - 1 + displayedOptionsArray.length) % displayedOptionsArray.length
        }

        displayedOptionsArray[selectedIndex].focus()
    }

    handleKey(e) {
        // Escape
        if (e.code === "Escape") {
            this.close()
        }
        // Arrows
        if ((e.code === "ArrowUp" || e.code === "ArrowDown") && Array.from(this.displayedOptions).includes(e.target)) {
            e.preventDefault()
            this.arrowNavigation(e.code)
        }
    }

    setAttributes = (elements, tabIndex, ariaHidden) => {
        elements.forEach(element => {
            element.setAttribute("tabindex", tabIndex)
            element.setAttribute("aria-hidden", ariaHidden)
        })
    }

    open() {
        this.displayedOptions = this.dropdown.querySelectorAll(".option-item")

        this.setAttributes(this.focusableInsideElements, "1", "false")
        this.setAttributes(this.displayedOptions, "1", "false")
        this.setAttributes(this.focusableOutsideElements, "-1", "true")

        this.boundClick = this.handleClick.bind(this)
        this.boundKey = this.handleKey.bind(this)
        this.boundSearchOnChange = this.searchOnChange.bind(this)

        document.addEventListener("click", this.boundClick)
        document.addEventListener("keydown", this.boundKey)
        this.input.addEventListener("input", this.boundSearchOnChange)

        this.dropdown.dataset.toggle = "extended"
        this.input.focus()
    }

    close() {
        this.setAttributes(this.focusableInsideElements, "-1", "true")
        this.setAttributes(this.displayedOptions, "-1", "true")
        this.setAttributes(this.focusableOutsideElements, "0", "false")

        document.removeEventListener("click", this.boundClick)
        document.removeEventListener("keydown", this.boundKey)
        this.input.removeEventListener("input", this.boundSearchOnChange)
        this.dropdown.dataset.toggle = "collapse"
    }

    reset() {
        this.input.value = null
        this.resetBtn.style.display = "none"
        this.resetBtn.setAttribute("aria-hidden", "true")
        this.input.focus()
    }
}