import React, { useState, useEffect } from "react";
import { default as axios } from "axios";
import Header from "./components/Header";
import Footer from "./components/Footer";
import CoinNav from "./components/CoinNav";
import SearchBar from "./components/SearchBar";
import Details from "./components/Details";

function App() {
  const coinNavLength = 10;
  const defaultVsCurrency = {
    name: "usd",
    symbol: "$",
  };
  const defaultPriceHistoryDays = 182;
  const [error, setError] = useState(undefined);
  const [coinData, setCoinData] = useState(undefined);
  const [coinList, setCoinList] = useState(undefined);
  const [coinNavData, setCoinNavData] = useState(undefined);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState(undefined);
  const [chartData, setChartData] = useState({});

  const fetchCoinList = () => {
    axios
      .get("https://api.coingecko.com/api/v3/coins/list")
      .then((response) => setCoinList(response.data.map((coin) => coin.name))) // TODO - add error check
      .catch((error) => console.log(error));
  };

  const fetchCoinDataById = (id) => {
    axios
      .get(`https://api.coingecko.com/api/v3/coins/markets`, {
        params: {
          vs_currency: defaultVsCurrency.name,
          ids: id,
        },
      })
      .then((response) => {
        if (!response || !response.data || response.data.length < 1)
          throw new Error(
            `Unable to find data for "${id}"...
            Check the spelling or try a different search term.`
          );
        setSearchTerm(response.data[0].name);
        setCoinData(response.data[0]);
        fetchCoinPriceHistory(
          id,
          defaultVsCurrency.name,
          defaultPriceHistoryDays
        );
      })
      .catch((error) => {
        setError(error.message);
        console.log(error);
      });
  };

  const fetchCoinDataByName = (name) => {
    const id = name.trim().replace(/\s+/g, "-").toLowerCase();
    fetchCoinDataById(id);
  };

  const fetchCoinPriceHistory = (id, vs_currency, days) => {
    axios
      .get(`https://api.coingecko.com/api/v3/coins/${id}/market_chart`, {
        params: { vs_currency, days },
      })
      .then((response) => {
        if (!response || !response.data || response.data.prices.length < 1)
          throw new Error(
            `Error while fetching price history for "${id}"...
            Check the spelling or try a different search term.`
          );
        const {
          data: { prices },
        } = response;
        setChartData({
          labels: prices.map((price, index) => {
            let date = new Date();
            date.setDate(date.getDate() - (prices.length - index - 1));
            const intlDate = new Intl.DateTimeFormat("en-UK").format(date);
            return intlDate;
          }),
          datasets: [
            {
              label: "Price in USD",
              data: prices.map((price) => price[1]),
              borderColor: "#4717f6",
              backgroundColor: "#062f4f",
              fill: true,
            },
          ],
        });
      })
      .catch((error) => {
        setError(error.message);
        console.log(error);
      });
  };

  useEffect(() => {
    const fetchCoinNavData = (n) => {
      axios
        .get("https://api.coingecko.com/api/v3/coins/markets", {
          params: {
            vs_currency: defaultVsCurrency.name,
            per_page: n,
          },
        })
        .then((response) => setCoinNavData(response.data)) // TODO - add error check
        .catch((error) => console.log(error));
    };

    fetchCoinNavData(coinNavLength);
    fetchCoinList();
  }, [defaultVsCurrency.name]);

  const handleSearchTermChange = (e) => {
    const text = e.target.value.replace("\\", "");
    setSearchTerm(text);
    let matches = [];
    if (text.length > 0) {
      matches = coinList.filter((coinName) => {
        let regex = new RegExp(`${text}`, "gi");
        return coinName.match(regex);
      });
    }
    setSearchSuggestions(matches);
  };

  const handleSuggestionSelect = (suggestion) => {
    setSearchTerm(suggestion);
    setSearchSuggestions([]);
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (searchTerm.trim().length > 0) {
      fetchCoinDataByName(searchTerm);
    }
  };

  return (
    <div className="App">
      <div className="page-wrapper">
        <Header />
        {(coinNavData && coinList && (
          <>
            <CoinNav
              fetchCoinDataById={fetchCoinDataById}
              coinNavData={coinNavData}
            />
            <SearchBar
              handleSearchSubmit={handleSearchSubmit}
              searchTerm={searchTerm}
              handleSearchTermChange={handleSearchTermChange}
              setSearchSuggestions={setSearchSuggestions}
              searchSuggestions={searchSuggestions}
              handleSuggestionSelect={handleSuggestionSelect}
            />
          </>
        )) || <div className="loader"></div>}
        <Details
          coinData={coinData}
          chartData={chartData}
          defaultVsCurrency={defaultVsCurrency}
          error={error}
        />
        <Footer />
      </div>
    </div>
  );
}

export default App;
