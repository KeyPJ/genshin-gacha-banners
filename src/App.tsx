import './App.css'

import {BrowserRouter, Route} from "react-router-dom";
import GI from "./pages/GI";
import HSR from "./pages/HSR";
import {useRegisterSW} from "virtual:pwa-register/react";
import {useEffect} from "react";
import {inject} from "@vercel/analytics";

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
            <Route exact path="/">
                <GI/>
            </Route>
            <Route exact path="/hsr">
                <HSR/>
            </Route>
        </BrowserRouter>
        </div>

    );
}

export default App
