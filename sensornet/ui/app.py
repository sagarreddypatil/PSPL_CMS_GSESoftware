import tkinter as tk


class TextLabel(tk.Label):
    def __init__(self, parent, *args, **kwargs):
        super().__init__(parent, *args, **kwargs)
        self.config(font=("Libre Franklin", 12))


class HeaderLabel(tk.Label):
    def __init__(self, parent, *args, **kwargs):
        super().__init__(parent, *args, **kwargs)
        self.config(font=("Saira Bold", 24))


class App(tk.Tk):
    def __init__(self):
        super().__init__()

        for i in range(2):
            self.grid_columnconfigure(i, weight=1)

        def flexrow(weight=1):
            nonlocal row
            self.grid_rowconfigure(row, weight=weight)

        row = 0

        def incrow():
            nonlocal row
            row += 1

        # Create the title label
        self.title_label = HeaderLabel(self, text="CMS SensorNet Decode")
        self.title_label.grid(row=row, column=0, columnspan=2)
        incrow()

        # add spacer
        self.spacer = tk.Label(self, text="")
        self.spacer.grid(row=row, column=0, columnspan=2)
        self.grid_rowconfigure(row, minsize=30)
        flexrow(1)

        incrow()

        # Create the file selector label and widget
        self.file_label = tk.Button(self, text="Select Config File")
        self.file_label.grid(row=row, column=0, columnspan=1, sticky="nsew")

        self.file_display = TextLabel(self, text="File Loaded: None")
        self.file_display.grid(row=row, column=1, sticky="nsew")
        incrow()

        # Create the device IP label and widget
        self.ip_label = TextLabel(self, text="Device IP:")
        self.ip_label.grid(row=row, column=0, sticky="nsew")
        self.ip_display = TextLabel(self)
        self.ip_display.grid(row=row, column=1, sticky="nsew")
        incrow()

        self.spacer2 = tk.Label(self, text="")
        self.spacer2.grid(row=row, column=0, columnspan=2)
        self.grid_rowconfigure(row, minsize=50)
        incrow()

        # Create the Start Server and Open Web UI buttons
        self.start_button = tk.Button(self, text="Start Server")
        self.start_button.grid(row=row, column=0, sticky="nsew")
        self.web_button = tk.Button(self, text="Open Web UI")
        self.web_button.grid(row=row, column=1, sticky="nsew")
        flexrow(10)
        incrow()
