import { defineStore, storeToRefs } from "pinia";

import { useLiteWalletStore } from "@/store/zksync/lite/wallet";

export const useLiteAccountActivationStore = defineStore("liteAccountActivation", () => {
  const liteWalletStore = useLiteWalletStore();
  const { isRemoteWallet } = storeToRefs(liteWalletStore);

  const {
    result: isAccountActivated,
    inProgress: accountActivationCheckInProgress,
    execute: checkAccountActivation,
    reload: reloadAccountActivation,
  } = usePromise<boolean>(async () => {
    const wallet = await liteWalletStore.getWalletInstance();
    if (!wallet) throw new Error("Wallet is not available");
    const accountState = await liteWalletStore.requestAccountState();
    if (!accountState) throw new Error("Account state is not available");

    let activated = false;
    if (wallet.syncSignerConnected()) {
      const newPubKeyHash = isRemoteWallet.value
        ? await wallet.syncSignerPubKeyHash()
        : await wallet.signer!.pubKeyHash();
      activated = accountState.committed.pubKeyHash === newPubKeyHash;
    } else {
      activated = accountState.committed.pubKeyHash !== "sync:0000000000000000000000000000000000000000";
    }
    return activated;
  });

  return {
    isAccountActivated,
    accountActivationCheckInProgress,
    checkAccountActivation,
    reloadAccountActivation,
  };
});
