# block-it

block-it is a command-line tool designed to help you block and unblock websites by modifying the hosts file on your system. It provides a simple and efficient way to manage access to specific websites for a specified duration or indefinitely.

## Installation

### Prerequisites

- Node.js installed on your system.

### Global Installation

You can install block-it globally using npm:

```sh
npm install -g block-it
```

This will make the `block-it` command available system-wide.

## Usage

To use block-it, prefix the command with `sudo` to grant the necessary permissions for modifying the hosts file.

### Blocking Websites

To block one or more websites by name, use the following command:

```sh
sudo block-it block <website1> <website2> ...
```

#### Example

```sh
sudo block-it block youtube.com twitter.com
```

### Blocking Websites for a Duration

To block websites for a specified duration using URLs from a text file, use the following command:

```sh
sudo block-it <duration> <filePath>
```

#### Example

```sh
sudo block-it 2m urls.txt
```

- `<duration>`: Specify the duration in minutes (e.g., `30m`) or hours (e.g., `2h`). If only a number is provided, it will be considered as minutes.
- `<filePath>`: Specify the path to a text file (`.txt`) containing a list of URLs separated by commas.

### Unblocking Websites

To unblock websites, use the following command:

```sh
sudo block-it unblock
```

This command will list currently blocked websites and allow you to select the ones you want to unblock.

## Contributing

Contributions are welcome! Please feel free to clone the repository and start working on it. You can submit pull requests for any improvements or new features you'd like to see in block-it.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```

This README.md file now includes handling for the duration when only a number is used, specifying the file format for URLs as a text file (.txt) with URLs separated by commas. Feel free to use this updated content in your project!
```
