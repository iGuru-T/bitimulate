import { createAction, handleActions } from 'redux-actions';

import { Map, List, fromJS } from 'immutable';

import { pender } from 'redux-pender';
import {getCurrency} from 'lib/utils';

import * as ExchangeAPI from 'lib/api/exchange';
import * as ChartDataAPI from 'lib/api/chartData';
import * as PoloniexAPI from 'lib/api/poloniex';

// action types
const GET_INITIAL_RATE = 'trade/GET_INITIAL_RATE';
const SET_INDEX_OPTION = 'trade/SET_INDEX_OPTION';
const TOGGLE_SHOW_PINNED = 'trade/TOGGLE_SHOW_PINNED';
const UPDATE_TICKER = 'trade/UPDATE_TICKER';
const GET_CHART_DATA = 'trade/GET_CHART_DATA';
const SET_CHART_TYPE = 'trade/SET_CHART_TYPE';
const SET_CURRENCY_TYPE = 'trade/SET_CURRENCY_TYPE';
const UPDATE_LAST_CANDLE = 'trade/UPDATE_LAST_CANDLE';
const REGULAR_UPDATE = 'trade/REGULAR_UPDATE';
const GET_ORDER_BOOK = 'trade/GET_ORDER_BOOK';

// action creator
export const getInitialRate = createAction(GET_INITIAL_RATE, ExchangeAPI.getInitialRate);
export const setIndexOption = createAction(SET_INDEX_OPTION);
export const toggleShowPinned = createAction(TOGGLE_SHOW_PINNED);
export const updateTicker = createAction(UPDATE_TICKER);
export const getChartData = createAction(GET_CHART_DATA, ChartDataAPI.getChartData);
export const setChartType = createAction(SET_CHART_TYPE);
export const setCurrencyType = createAction(SET_CURRENCY_TYPE);
export const updateLastCandle = createAction(UPDATE_LAST_CANDLE);
export const regularUpdate = createAction(REGULAR_UPDATE, ChartDataAPI.getChartData);
export const getOrderBook = createAction(GET_ORDER_BOOK, PoloniexAPI.getOrderBook);

// initial state
const initialState = Map({
  index: Map({
    options: Map({
      showPinned: false,
      sortBy: 'alphabet',
      asc: true
    })
  }),
  rate: List([]),
  detail: Map({
    chartData: List([]),
    chartType: 'year',
    currencyType: null,
    timebase: null,
    orderBook: Map({
      buy: List(),
      sell: List()
    })
  })
});

// reducer
export default handleActions({
  ...pender({
    type: GET_INITIAL_RATE,
    onSuccess: (state, action) => {
      const { data: rate } = action.payload;

      const insertCurrencyName = (r) => {
        const currency = getCurrency(r.name);
        if(!currency) return r;


        return {
          ...r,
          currencyName: currency.get('name'),
          currencyKey: currency.get('key')
        }
      };

      return state.set('rate', fromJS(rate.map(insertCurrencyName)));
    }
  }),
  [SET_INDEX_OPTION]: (state, action) => {
    const { name, value } = action.payload;
    return state.setIn(['index', 'options', name], value);
  },
  [TOGGLE_SHOW_PINNED]: (state, action) => {
    return state.updateIn(['index', 'options', 'showPinned'], value => !value);
  },
  [UPDATE_TICKER]: (state, action) => {
    const { payload: data } = action;
    const index = state.get('rate').findIndex((ticker) => ticker.get('name') === data.name);
    return state.mergeIn(['rate', index], data);
  },
  ...pender({
    type: GET_CHART_DATA,
    onPending: (state, action) => {
      return state.setIn(['detail', 'chartData'], List([]))
                  .setIn(['detail', 'timebase'], null);
    },
    onSuccess: (state, action) => {
      const { data: chartData } = action.payload;
      const { 'x-timebase': timebase } = action.payload.headers;

      return state.setIn(['detail', 'chartData'], fromJS(chartData))
                  .setIn(['detail', 'timebase'], timebase);
    }
  }),
  ...pender({
    type: REGULAR_UPDATE,
    onSuccess: (state, action) => {
      const { data: chartData } = action.payload;
      const { 'x-timebase': timebase } = action.payload.headers;
  
      return state.setIn(['detail', 'chartData'], fromJS(chartData))
                  .setIn(['detail', 'timebase'], timebase)
    }
  }),
  [SET_CHART_TYPE]: (state, action) => {
    const { payload: chartType } = action;
    return state.setIn(['detail', 'chartType'], chartType);
  },
  [SET_CURRENCY_TYPE]: (state, action) => {
    const { payload: currencyType } = action;
    return state.setIn(['detail', 'currencyType'], currencyType);
  },
  [UPDATE_LAST_CANDLE]: (state, action) => {
    const { payload: value } = action;
  
    let chartData = state.getIn(['detail', 'chartData']);
    if (chartData.isEmpty()) return state;
  
    let lastCandle = chartData.get(chartData.size - 1);
    const { high, low, close } = lastCandle.toJS();
  
    // lower
    if (value > high) {
      lastCandle = lastCandle.set('high', value);
    }
  
    // higher
    if (value < low) {
      lastCandle = lastCandle.set('low', value);
    }
  
    // same
    if (value === close) return state;
    lastCandle = lastCandle.set('close', value);
  
    chartData = chartData.set(chartData.size - 1, lastCandle);
    return state.setIn(['detail', 'chartData'], chartData);
  },
  ...pender({
    type: GET_ORDER_BOOK,
    onSuccess: (state, action) => {
      const { 
        bids: buy, 
        asks: sell 
      } = action.payload.data;
  
      return state.setIn(['detail', 'orderBook'], Map({
        buy: fromJS(buy),
        sell: fromJS(sell)
      }))
    }
  })
}, initialState);