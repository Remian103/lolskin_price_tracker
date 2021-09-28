import React, { useEffect, useState, useMemo } from "react";
import { Div, Text } from "atomize";
import { useParams } from "react-router-dom";

import useDataFetch from "../hooks/useDataFetch";
import Carousel from "../components/Carousel";
import HistoryChart from "../components/HistoryChart";
import CommentList from "../components/CommentList";
import { AnchorObj } from "../interfaces/Nav.interface";
import { SkinObj, SkinFullObj, PriceHistory } from "../interfaces/Fetch.interface";


interface MatchParams {
    skinId: string;
}

function Skins({ setNav }: { setNav: React.Dispatch<React.SetStateAction<AnchorObj[]>> }) {
    const { skinId } = useParams<MatchParams>();

    // header navigation tab
    useEffect(() => {
        setNav([
            { id: 0, name: "홈", link: "/home", type: "link" },
            { id: 1, name: "마이 페이지", link: "/myPage", type: "link" },
            { id: 2, name: "가격 그래프", link: "#chart", type: "hash" },
            { id: 3, name: "다른 스킨들", link: "#champions", type: "hash" },
            { id: 4, name: "댓글", link: "#comments", type: "hash" }
        ]);
    }, [setNav]);


    // skin data fetch
    const [{ data: skin }, doSkinFetch] = useDataFetch<SkinFullObj>(
        `/api/skins/${skinId}`,
        {
            id: Number(skinId),
            name: "",
            trimmed_image_url: "",
            full_image_url: "",
            champion_id: -1,
            last_price_history: {
                skin_id: -1,
                date: "",
                price: -1,
                sale_price: -1,
                is_available: false
            },
            description: "",
            price_history: []
        }
    );


    // update when skin id changed
    useEffect(() => {
        if(Number(skinId) !== skin.id) {
            console.log(skinId, skin.id);
            doSkinFetch(`/api/skins/${skinId}`);
        }
    }, [skinId]);


    //generate chart data
    const [chartLabel, setLabel] = useState<string[]>([]);
    const [chartData, setData] = useState<number[]>([]);
    const chartOption = useMemo(() => {
        return {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    stackWeight: 1,
                    ticks: {
                        color: "black"
                    }
                },
                x: {
                    ticks: {
                        color: "black"
                    }
                }
            },
            plugins: {
                legend: false
            }
        };
    }, []);
    useEffect(() => {
        const history: PriceHistory[] = skin.price_history || [];

        history.sort((a: PriceHistory, b: PriceHistory) => a.date < b.date ? -1 : a.date > b.date ? 1 : 0);
        setLabel(history.map((item: PriceHistory) => item.date));
        setData(history.map((item: PriceHistory) => item.sale_price));
    }, [skin]);


    // skin list of champion
    const [{ data: skinList }, doSkinListFetch] = useDataFetch<SkinObj[]>("initialUrl", []);
    useEffect(() => {
        if (skin.champion_id !== -1) {
            doSkinListFetch(`/api/champions/${skin.champion_id}/skins`);
        }
    }, [skin.champion_id]);


    return (<>
        <Div className="background-skin" bgImg={skin.full_image_url} />

        <Div p="200px"></Div>

        <div className="content-container skins" /* main content */ >
            <div className="content-background" />

            <div className="content-title">
                <Text
                    textSize={{ xs: "1rem", md: "1.5rem" }}
                >
                    {skin.name === "default" ? "기본 스킨" : skin.name}
                </Text>
            </div>

            {skin.name === "default" ? null :
                <>
                    <div className="hash-link" id="chart" />
                    <Div p={{
                        x: "1rem",
                        b: "2rem"
                    }}>
                        <HistoryChart className="shadowDiv" chartOption={chartOption} chartLabel={chartLabel} chartData={chartData} />
                    </Div>
                </>
            }


            <div className="hash-link" id="champions" />
            <div className="content-title">
                <Text
                    textSize={{ xs: "1rem", md: "1.5rem" }}
                >
                    챔피언의 다른 스킨들
                </Text>
            </div>
            <Carousel list={skinList} type="champion-skins" />

            <div className="hash-link" id="comments" />
            <div className="content-title">
                <Text
                    textSize={{ xs: "1rem", md: "1.5rem" }}
                >
                    Comments
                </Text>
            </div>
            <Div p={{ x: "1rem" }}>
                <CommentList skinId={skinId} />
            </Div>
        </div>
    </>);
}

export default Skins;