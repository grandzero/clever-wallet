# Clever Wallet: AI-Powered Starknet Wallet Assistant

![Clever Wallet Demo](demo/demo.gif)

## Try It Out

📱 **[Live Demo: Clever Wallet](https://clever-wallet.vercel.app/)**

Experience the future of crypto management – where blockchain complexity meets conversational simplicity.

## Overview

Clever Wallet is an innovative, AI-driven wallet interface for Starknet, designed to simplify and enhance the user experience in blockchain interactions. By leveraging natural language processing and advanced AI capabilities, Clever Wallet allows users to manage their crypto assets, perform transactions, and interact with the Starknet ecosystem using simple, conversational commands.

[Watch the Clever Wallet Demo Video](https://bu2.pw/cleverwallet)

## Features

- **Natural Language Interactions**: Communicate with your wallet using everyday language.
- **Balance Inquiries**: Easily check your ETH and token balances.
- **Token Transfers**: Send tokens to other addresses with simple commands.
- **Transaction Simulation**: Simulate transactions before execution to understand their effects.
- **Raw Transaction Analysis**: Input and analyze complex transactions in a user-friendly manner.
- **AI-Powered Explanations**: Get clear, concise explanations of blockchain operations and transaction details.

## Technologies Used

- **Frontend**: Next.js, React, TailwindCSS
- **Backend**: Next.js API Routes
- **Blockchain Interaction**: Starknet.js, StarknetKit
- **AI and Natural Language Processing**: OpenAI GPT-4
- **State Management**: React Context API
- **TypeScript**: For type-safe code and enhanced developer experience
- **Deployment**: Vercel

## Getting Started

1. Clone the repository:

   ```
   git clone https://github.com/yourusername/clever-wallet.git
   ```

2. Install dependencies:

   ```
   cd clever-wallet
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory and add your OpenAI API key:

   ```
   OPENAI_API_KEY=your_api_key_here
   ```

4. Run the development server:

   ```
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Usage

1. Visit the [Clever Wallet Demo](https://clever-wallet.vercel.app/) or your locally running instance.
2. Connect your Starknet wallet (e.g., ArgentX) to the application.
3. Use the chat interface to interact with your wallet. Some example commands:
   - "What's my ETH balance?"
   - "Send 0.1 ETH to 0x1234..."
   - "Simulate a transaction to swap 10 USDC for ETH"
   - "Explain this raw transaction: [paste transaction data]"

## Future Roadmap

We're constantly working to improve Clever Wallet. Here are some exciting features on our roadmap:

- **Enhanced Operation Support**: Expand the range of supported operations to cover more complex blockchain interactions.
- **DEX Integration**: Direct integration with decentralized exchanges for seamless token swaps.
- **Speech-to-Text Support**: Enable voice commands for an even more natural interaction experience.
- **Native Account Abstraction**: Implement native support for Starknet's account abstraction features.
- **Email Sign-In with Account Abstraction**: Allow users to sign in and manage their wallet using just an email address, leveraging account abstraction for a seamless experience.
- **Multi-Chain Support**: Expand beyond Starknet to support multiple blockchain networks.

## Contributing

We welcome contributions to Clever Wallet! Please see our [Contributing Guide](CONTRIBUTING.md) for more details on how to get started.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Thanks to the Starknet and StarknetKit teams for their fantastic tools and documentation.
- Special thanks to OpenAI for providing the powerful GPT models that drive our AI assistant.
- Kudos to Vercel for their excellent hosting and deployment platform.

---

Clever Wallet - Making blockchain interactions as easy as a conversation.
