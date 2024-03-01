````markdown
# block-it

block-it is a command-line tool designed to help you block and unblock websites by modifying the hosts file on your system. It provides a simple and efficient way to manage access to specific websites for a specified duration or indefinitely.

## Features

- Block or unblock websites by name.
- Block websites for a specified duration using URLs from a text file.
- View a list of currently blocked websites and unblock them selectively.

## Installation

### Prerequisites

- Node.js installed on your system.

### Installation Steps

1. Clone this repository to your local machine:

   ```sh
   git clone https://github.com/your-username/block-it.git
   ```
````

2. Navigate to the cloned directory:

   ```sh
   cd block-it
   ```

3. Install dependencies using npm:

   ```sh
   npm install
   ```

## Usage

### Blocking Websites

To block one or more websites by name, use the following command:

```sh
block-it block <website1> <website2> ...
```

### Blocking Websites for a Duration

To block websites for a specified duration using URLs from a text file, use the following command:

```sh
block-it <duration> <filePath>
```

- `<duration>`: Specify the duration in minutes (e.g., `30m`) or hours (e.g., `2h`).
- `<filePath>`: Specify the path to a text file containing a list of URLs to block.

### Unblocking Websites

To unblock websites, use the following command:

```sh
block-it unblock
```

This command will list currently blocked websites and allow you to select the ones you want to unblock.

## Contributing

Contributions are welcome! Please feel free to open an issue or submit a pull request for any improvements or new features you'd like to see in block-it.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```

Feel free to customize it further to fit your preferences or add any additional information you think would be helpful for users!
```
