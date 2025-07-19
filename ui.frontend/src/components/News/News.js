import React, {useEffect, useState} from 'react';
import api from "../../axios";
import './news.css'

const News = () => {

    const [data, setData] = useState(null);
    const [dataList, setDataList] = useState([])
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false)

    useEffect(() => {

        const idParam = new URLSearchParams(window.location.search).get('id')
        if (idParam) {
            api.post("/getNewsByPath", {
                "query": "query getNewsByPath($path: String!) { not_ciaByPath(_path: $path) {item {title subtitle date author image {... on ImageRef {_path}} body {html}}}}",
                "variables": {
                    "path": `/content/dam/aem-spa-sccp/contentfragments/news/${idParam}`
                }
            })
                .then((r) => {
                    console.log(r.data)
                    setData(r.data.data.not_ciaByPath.item);
                })
                .catch(() => {
                    setError(true)
                })
                .finally(() => {
                    setLoading(false)
                })
        } else {
            api.post("/getNews", {
                "query": "query getNews {not_ciaList {items { title subtitle date author image { ... on ImageRef { _path }} body{ html }}}}",
                "variables": {}
            })
                .then((r) => {
                    console.log(r.data)
                    setDataList(r.data.data.not_ciaList.items);
                    console.log(data)
                })
                .catch(() => {
                    setError(true)
                })
                .finally(() => {
                    setLoading(false)
                })
        }

    }, []);

    if (loading) {
        return <div>Carregando notícia...</div>;
    }

    if (error) {
        return <div>Não foi possível recuperar a notícia.</div>
    }

    if (data != null) {
        return (
            <div className="d-flex justify-content-center">
                <div className="w-50">
                    <div>
                        <h1 className="text-black fw-bolder">{data.title}</h1>
                        <h3 className="text-black fw-bolder">{data.subtitle}</h3>
                        <p className="fs-6">{Intl.DateTimeFormat('pt-BR', {year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'}).format(new Date(data.date))} - {data.author}</p>
                    </div>
                    <img className="w-100 my-3" src={`${data.image._path}`} alt=""/>
                    <div dangerouslySetInnerHTML={{ __html: data.body.html }} />
                </div>
            </div>
        )
    }

    return (
        <div className="mx-5">
            <h1 className="my-3 text-black fw-bolder">NOTÍCIAS</h1>
            <div className="d-flex flex-column gap-2 me-3">
                {dataList.map((news, index) => {
                    const newsId = news._path.split("/").pop();
                    return (
                        <a className="text-decoration-none" href={`http://localhost:4502/content/aem-spa-sccp/noticias.html?wcmmode=disabled&id=${newsId}`}>
                            <div key={index} className="col-12 d-flex flex-column flex-md-row gap-2">
                                <img className="col-12 col-md-3" src={`${news.image._path}`} alt=""/>
                                <div className="d-flex flex-column">
                                    <h3>{news.title}</h3>
                                    <p className="fs-6">{Intl.DateTimeFormat('pt-BR', {year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'}).format(new Date(news.date))} - {news.author}</p>
                                </div>
                            </div>
                        </a>
                    )
                })}
            </div>
        </div>
    )

}

export default News;