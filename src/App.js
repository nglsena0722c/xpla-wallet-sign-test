import {
    useConnectedWallet,
    UserDenied,
    useWallet,
    WalletStatus,
    verifyBytes
} from "@xpla/wallet-provider";
import React, { useState, useEffect } from "react";
import { SimplePublicKey } from "@xpla/xpla.js";

export default function App() {
    const {
        status,
        wallets,
        connect,
        disconnect
    } = useWallet();

    const connectedWallet = useConnectedWallet();


    const [signresult, setSignResult] = useState(null);
    const [signError, setsignError] = useState(null);
    const [signverifyResult, setSignVerifyResult] = useState("not verified");

    const handleSignbytes = async () => {
        const signMessages = `test`;

        try {
            const result = await connectedWallet.signBytes(Buffer.from(signMessages));
            setSignResult(result);
        } catch (error) {
            if (error instanceof UserDenied) {
                setsignError("User Denied");
            } else {
                setsignError("Unknown Error: " + error instanceof Error ? error.message : String(error));
            }
        }
    };

    useEffect(() => {
        const signMessages = `test`;

        if (!signresult) {
            setSignVerifyResult("not verified")
            return;
        }

        const signature = signresult.result.signature;
        const signresultpubkey = signresult.result.public_key;
        const public_key = new SimplePublicKey(signresultpubkey.key);
        const signbytes = {
            signature: new Uint8Array(Object.values(signature)),
            public_key
        };

        const checkAddress = (wallets[0].xplaAddress === public_key.address());
        setSignVerifyResult((verifyBytes(Buffer.from(signMessages), signbytes) && (checkAddress === true)) ? "verified" : "wrong signbytes")
    }, [signresult, setSignVerifyResult, wallets]);

    return <div className="example-container">
        {status === WalletStatus.WALLET_NOT_CONNECTED ? (
            <>
                <button
                    className="button-css width-full"
                    type="button"
                    onClick={() => connect()}
                >
                    Connect Wallet
                </button>
                <p className="warning">If there is no change even after clicking the button, please press the refresh button in the bottom right corner of the screen.</p>
            </>
        ) : (
            <>
                <div className="info-container">
                    <div className="info-title">Connected Address</div>
                    <div className="info-content">
                        {wallets.length === 0 ? "Loading..." : wallets[0].xplaAddress}
                    </div>
                </div>
                <div className="bottom-button-container">
                    <button className="button-css" type="button" onClick={handleSignbytes}>
                        Signbytes
                    </button>
                    <button className="button-css" type="button" onClick={disconnect}>
                        Disconnect
                    </button>
                </div>

                {signresult && (
                    <div style={{ marginTop: 20 }}>
                        <div className="info-title">Signature Verify</div>
                        <div className="info-content">
                            <span>
                                {signverifyResult}
                            </span>
                        </div>
                    </div>
                )}
                {signError && (
                    <div style={{ marginTop: 20 }}>
                        <div className="info-title">Tx Error</div>
                        <div className="info-content">
                            <span>
                                {signError}
                            </span>
                        </div>
                    </div>
                )}
            </>
        )}
    </div>
}