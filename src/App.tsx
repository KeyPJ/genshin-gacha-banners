import './App.css'

import {BrowserRouter, Route} from "react-router-dom";
import GI from "./pages/GI";
import HSR from "./pages/HSR";
import {useRegisterSW} from "virtual:pwa-register/react";
import {useEffect} from "react";
import {inject} from "@vercel/analytics";
import ZZZ from "./pages/ZZZ";

function App() {

    const intervalMS = 60 * 60 * 1000
    useRegisterSW({
        onRegistered(r) {
            r && setInterval(() => {
                r.update()
            }, intervalMS)
        }
    });

    useEffect(() => {
        inject()
    }, [])

    return (
        <div><BrowserRouter>
            <Route key="gi" exact path="/">
                <GI/>
            </Route>
            <Route key="hsr" exact path="/hsr">
                <HSR/>
            </Route>
            <Route key="zzz" exact path="/zzz">
                <ZZZ/>
            </Route>
        </BrowserRouter>
        </div>

    );
}

export default App
