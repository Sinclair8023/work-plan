/**
 * title  标题
 * person 负责人
 * mission 任务 {desc,time,person}
 * start
 */
import React from 'react'
import moment from 'moment'
import ReactEcharts from 'echarts-for-react'
import Flex from './components/Flex'
import { DatePicker, InputNumber, Radio, Input, Button, Mention, Tabs, Switch  } from 'antd'
const RadioGroup = Radio.Group
const InputGroup = Input.Group
const TabPane = Tabs.TabPane;
const ButtonGroup = Button.Group
const { toContentState } = Mention;
let ID = 0
const getUUID = () => ID++
const ALL_MAN = [
  '吴小康', '桂恩来', '刘冰源'
]
class Plan extends React.Component {
  constructor(props) {
    super(props)
    this.state = this.initState()
  }
  initMission = () => ({
    desc: '', time: 1, key: getUUID()
  })
  initState = () => {
    return {
      title: '排期计划',
      persons: ['xxx', 'yyy'],
      members: toContentState('@吴小康'),
      mission: {
        吴小康: [this.initMission()],
      },
      start: {
        吴小康:  moment().set('hour', 8),
      },
      unit: 0.2,
      noSatDay: true,
      noSunDay: true
    }
  }
  // 合计时间
  getTime = () => {
    let { mission, start } = this.state
    let startTime = moment.min(Object.values(start))
    let endTime = moment.max( Object.entries(mission).map(([p,ms]) => start[p].clone().add(ms.reduce((a,b) => a + b.time, 0), 'days')))
    let sumDays =  Math.ceil((endTime - startTime) / 1000 / 3600 / 24) + 1
    return {
      sumDays,
      startTime,
      endTime
    }
  }
  renderRow = (p, m , index) => {
    let { unit, mission, start } = this.state
    let {
      sumDays, startTime
    } = this.getTime()
    // 合计时间 向下取整 得到天数
    let timeTd = new Array(Math.ceil(sumDays / unit)).fill(1)
    let { time } = m
    let curStartTime = start[p]
    let startDays = +((curStartTime- startTime)/ 1000 / 3600 / 24).toFixed(1)
    if(startDays === 0){
      startDays = curStartTime.diff(startTime.clone().set('hour', 8), 'hour') / 10
    }
    let beforeDays = mission[p].filter((v, i) => i < index)
    beforeDays = startDays + ( !beforeDays.length ? 0 : beforeDays.reduce((a, b) => a + b.time, 0))
    let endTime = beforeDays + time
    return (
      <tr key={`${p}-${this.missionLength}`}>
        <td>{this.missionLength++}</td>
        <td>{m.desc}</td>
        <td>{m.time}</td>
        {
          timeTd.map((v, i) => <td key={i} style={{
            background: i >= beforeDays/unit && i < endTime/unit ? 'green' : 'white'
          }} />)
        }
        <td>{p}</td>
      </tr>
    )
  }
  getWordDay = (time, i, max) => {
    if(i === 0){
      this.passWeekends = 0
    }
    let nextDay = time.clone().add(i + 2 * this.passWeekends, 'days')
    let week = nextDay.format('d')
    if(this.state.noSatDay && week === '6'){
      this.passWeekends += 0.5
      nextDay.add(1, 'days')
    }
    week = nextDay.format('d')
    if(this.state.noSunDay && week === '0'){
      this.passWeekends += 0.5
      nextDay.add(1, 'days')
    }
    week = nextDay.format('d')
    let isWeekend =  week === '0' || week === '6'
    return (
      <td
        key={i}
        colSpan={1 / this.state.unit}
        style={{ background: isWeekend && '#1890ff' }}>
        {nextDay.format('MM/DD')}
      </td>
    )
  }
  renderTable() {
    const { title, person, mission, start, unit } = this.state
    let { sumDays, startTime } = this.getTime()
    console.log('sumDays',sumDays)
    let timeTd = new Array(sumDays).fill(1)
    let index = 0
    this.missionLength = 1
    console.log(Mention.toString(this.state.members))
    return (
      <table ref={ref => this.table = ref}>
        <thead>
          <tr><td colSpan={4 + timeTd.length / unit} style={{ textAlign: 'center' }}>{title}</td></tr>
          <tr>
            <td rowSpan={2}>No.</td>
            <td rowSpan={2} style={{ width: 150 }}>任务</td>
            <td rowSpan={2}>人日</td>
            <td colSpan={timeTd.length / unit}>时间</td>
            <td rowSpan={2} style={{width:50}}>责任人</td>
          </tr>
          <tr>
            {
              timeTd.map((v, i) => this.getWordDay(startTime, i, sumDays))
            }
          </tr>
        </thead>
        <tbody>
          {
            Object.entries(mission).map(([key, ms]) => ms.map((m, index) => this.renderRow(key, m, index)))
          }
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={2}>合计</td>
            <td>{sumDays}</td>
            <td colSpan={1 + timeTd.length / unit}>-</td>
          </tr>
        </tfoot>
      </table>
    )
  }
  onMissionSwap = (p, i) => () => {
    let m = this.state.mission[p]
    m.splice(i - 1, 0, m.splice(i, 1))
    this.setState({
      mission: {
        ...this.state.mission
      }
    })
  }
  onMissionToggle = (p, i, isAdd) => () => {
    let m = this.state.mission[p]
    if (isAdd) {
      m.push(this.initMission())
    } else {
      m.splice(i, 1)
    }
    this.setState({
      mission: {
        ...this.state.mission
      }
    })
  }
  onSimpleChange = key => e => {
    let value = e && e.target ? e.target.value : e
    this.setState({
      [key]: value
    })
  }
  onMembersChange = members => {
    let { mission, start } = this.state
    let newMission = {}, newStart = {}
    let memberArr = Mention.getMentions(members).map(v => v.replace('@',''))
    memberArr.forEach(m => {
      if(mission[m]){
        newMission[m] = mission[m]
        newStart[m] = start[m]
      }else{
        newMission[m] = [
          { desc: '需求理解', time: 1, key: getUUID() },
        ]
        newStart[m] = moment().set('hour', 8)
      }
    })
    
    this.setState({
      members,
      mission: newMission,
      start: newStart
    })
  }
  onMissionChange = (p, index, key) => e  => {
    let value = e && e.target ? e.target.value : e
    let { mission } = this.state
    mission[p][index][key] = value
    this.setState({
      mission: {
        ...mission
      }
    })
  }
  onStartChange = (p) => e => {
    let value = e && e.target ? e.target.value : e
    let {start} = this.state
    start[p] = value
    this.setState({
      start: {...start}
    })
  }
  // 渲染表单
  renderForm = () => {
    const disabledHours = [1, 2, 3, 4, 5, 6, 7, 19, 20, 21, 23, 23, 24, 0]
    const members = Mention.getMentions(this.state.members).map(v => v.replace('@',''))
    const {title, unit, start, noSatDay, noSunDay} = this.state
    return (
      <Flex dir="column" align="stretch" className="plan-form">
        <Flex>
          <label htmlFor="">排期内容</label>
          <Input value={this.state.title} onChange={this.onSimpleChange('title')} />
        </Flex>
        <Flex>
          <label htmlFor="">责任人</label>
          <Mention
            style={{ width: '100%' }}
            suggestions={ALL_MAN}
            value={this.state.members}
            onChange={this.onMembersChange}
          />
          {/* <Input placeholder="多个责任人之间已逗号隔开" value={this.state.persons.join('，')} onChange={e => this.setState({ persons: e.target.value.split('，') })} /> */}
        </Flex>
        <Flex>
          <label htmlFor="">排期刻度（天）</label>
          <RadioGroup onChange={this.onSimpleChange('unit')} value={unit}>
            <Radio value={0.1}>0.1</Radio>
            <Radio value={0.2}>0.2</Radio>
            <Radio value={0.5}>0.5</Radio>
            <Radio value={1}>1</Radio>
          </RadioGroup>
        </Flex>
        <Flex>
          <label htmlFor="">过滤周六</label>
          <Switch checked={noSatDay} onChange={this.onSimpleChange('noSatDay')} />
        </Flex>
        <Flex>
          <label htmlFor="">过滤周日</label>
          <Switch checked={noSunDay} onChange={this.onSimpleChange('noSunDay')} />
        </Flex>
        <Tabs>
          {
            members.map((p, i) => (
              <TabPane tab={p} key={i}>
                <Flex dir="column" align="stretch">
                  <Flex align="center">
                    {p}同学排期开始于
                    <DatePicker
                      allowClear
                      format="MM/DD HH"
                      showTime={
                        {
                          disabledHours: () => disabledHours,
                          format: 'HH'
                        }
                      }
                      value={start[p]}
                      onChange={this.onStartChange(p)}
                    />
                  </Flex>
                  {
                    !!this.state.mission[p] && this.state.mission[p].map((m, i) => (
                      <Flex>
                        <Input
                          addonBefore={i + 1}
                          style={{ flex: 1 }}
                          value={m.desc}
                          onChange={this.onMissionChange(p, i, 'desc')}
                        />
                        <InputNumber
                          style={{ width: 100 }}
                          min={unit}
                          step={unit}
                          formatter={value => `${value} day`}
                          parser={value => value.replace(' day', '')}
                          value={m.time}
                          onChange={this.onMissionChange(p, i, 'time')}
                        />
                        <Button icon={i === 0 ? 'plus' : 'minus'} onClick={this.onMissionToggle(p, i, i === 0)} />
                      </Flex>
                    ))
                  }
                </Flex>
              </TabPane>
            ))
          }
        </Tabs>
      </Flex>
    )
  }
  // 复制表格到剪贴板
  onCopy = () => {
    let body = document.body, range, sel;
    const el = this.table
    if (document.createRange && window.getSelection) {
      range = document.createRange();
      sel = window.getSelection();
      sel.removeAllRanges();
      try {
        range.selectNodeContents(el);
        sel.addRange(range);
        document.execCommand('Copy');
      } catch (e) {
        range.selectNode(el);
        sel.addRange(range);
        document.execCommand('Copy');
      }
    } else if (body.createTextRange) {
      range = body.createTextRange();
      range.moveToElementText(el);
      range.select();
      range.execCommand('Copy');
    }
  }
  // echarts option
  getOption = () => {
    let { mission } = this.state
    return {
      title: {
        text: this.state.title,
        x: 'center'
      },
      tooltip: {
        trigger: 'item',
        formatter: "{a} <br/>{b} : {c} ({d}%)"
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        data: []
      },
      series: {
        name: '用时',
        type: 'pie',
        radius: '55%',
        center: ['50%', '60%'],
        data: mission.map(v => ({
          value: v.time, name: v.desc
        })),
        itemStyle: {
          emphasis: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    };
  }
  render() {
    return (
      <div className="planBox">
        {
          this.renderForm()
        }
        <div className="plan-table">
          {this.renderTable()}
          {/* <ReactEcharts
            option={this.getOption()}
            notMerge={true}
            lazyUpdate={true}
            theme={"theme_name"}
            className="plan-chart"
          /> */}
          <button onClick={() => this.onCopy()}>复制表格</button>
        </div>
      </div>
    )
  }
}
export default Plan