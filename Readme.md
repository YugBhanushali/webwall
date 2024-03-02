# webwall

webwall is a command-line tool designed to help you block and unblock websites by modifying the hosts file on your system. It provides a simple and efficient way to manage access to specific websites for a specified duration or indefinitely.

## Installation

### Prerequisites

- Node.js installed on your system.

### Global Installation

You can install webwall globally using npm:

```sh
npm install -g webwall
```

This will make the `webwall` command available system-wide.

## Usage

To use webwall, prefix the command with `sudo` to grant the necessary permissions for modifying the hosts file.

### Blocking Websites

To block one or more websites by name, use the following command:

```sh
sudo webwall block <website1> <website2> ...
```

#### Example

```sh
sudo webwall block youtube.com twitter.com
```

### Blocking Websites for a Duration

To block websites for a specified duration using URLs from a text file, use the following command:

```sh
sudo webwall <duration> <filePath>
```

#### Example

```sh
sudo webwall 2m urls.txt
```

- `<duration>`: Specify the duration in minutes (e.g., `30m`) or hours (e.g., `2h`). If only a number is provided, it will be considered as minutes.
- `<filePath>`: Specify the path to a text file (`.txt`) containing a list of URLs separated by commas.

### Unblocking Websites

To unblock websites, use the following command:

```sh
sudo webwall unblock
```

This command will list currently blocked websites and allow you to select the ones you want to unblock.

## Contributing

Contributions are welcome! Please feel free to clone the repository and start working on it. You can submit pull requests for any improvements or new features you'd like to see in webwall.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
Feel free to copy and paste this updated content into your README.md file for the "webwall" package. Let me know if you need further adjustments!
```
