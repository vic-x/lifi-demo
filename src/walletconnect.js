import {
  configureChains,
  createClient,
  connect,
  fetchBalance,
  getNetwork,
  disconnect,
  watchSigner,
  fetchSigner,
  fetchToken,
  switchNetwork as SwitchNetwork,
} from "@wagmi/core";
import {
  polygonMumbai,
  polygon,
  mainnet,
  bsc,
  bscTestnet,
  arbitrum,
  avalanche,
  okc,
  optimism,
} from "@wagmi/core/chains";
import { publicProvider } from "@wagmi/core/providers/public";
import { CoinbaseWalletConnector } from "@wagmi/core/connectors/coinbaseWallet";
import { Web3Modal } from "@web3modal/html";
import {
  EthereumClient,
  w3mConnectors,
  w3mProvider,
} from "@web3modal/ethereum";
import { ref } from "vue";

const { chains, provider, webSocketProvider } = configureChains(
  [
    mainnet,
    polygon,
    bsc,
    arbitrum,
    avalanche,
    okc,
    optimism,
    polygonMumbai,
    bscTestnet,
  ],
  [
    w3mProvider({
      projectId: "93f994b8234627764080e048281e2e33",
    }),
    publicProvider(),
  ],
  { stallTimeout: 5000, pollingInterval: 5_000 }
);

let wagmiClient, web3modal;
const initWagmi = () => {
  wagmiClient = createClient({
    autoConnect: true,
    provider,
    webSocketProvider,
    connectors: [
      ...w3mConnectors({
        projectId: "93f994b8234627764080e048281e2e33",
        version: 1, // or "2"
        appName: "demo",
        chains,
      }).reverse(),
      new CoinbaseWalletConnector({
        chains,
        appName: "demo",
      }),
    ],
  });
  const ethereumClient = new EthereumClient(wagmiClient, chains);
  web3modal = new Web3Modal(
    { projectId: "93f994b8234627764080e048281e2e33" },
    ethereumClient
  );
  web3modal.setTheme({
    themeMode: "light",
    themeVariables: {
      "--w3m-z-index": "9999",
    },
    enableAccountView: true,
  });
};
initWagmi();
export const useWalletConnect = (signer, chain) => {
  const connectWallet = async (connector, chainId = polygonMumbai.id) => {
    try {
      const isOpenWeb3Modal = connector.id == "injected" && !window.ethereum;
      if (connector.id.indexOf("walletConnect") > -1 || isOpenWeb3Modal) {
        const defaultChain = chains.find((item) => item.id == chainId);
        web3modal.setDefaultChain(defaultChain || chains[0]);
        await web3modal.openModal();
      } else {
        const res = await connect({ chainId: chainId, connector });
      }
    } catch (error) {
      console.log(error);
    }
  };
  const switchNetwork = async (chainId) => {
    try {
      const network = await SwitchNetwork({
        chainId: chainId,
      });
    } catch (error) {}
  };
  return {
    connectors: wagmiClient?.connectors,
    chains,
    web3modal,
    switchNetwork,
    initWagmi,
    connectWallet,
  };
};
