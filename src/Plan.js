import React, { Fragment } from 'react'
import moment from 'moment'
import ReactEcharts from 'echarts-for-react'
import Flex from './components/Flex'
import { store } from './utils'
import { DatePicker, InputNumber, Radio, Input, Button, Mention, Tabs, Switch, Modal, Divider, Select, message  } from 'antd'
const RadioGroup = Radio.Group
const TextArea = Input.TextArea
const TabPane = Tabs.TabPane;
const ButtonGroup = Button.Group
const Option = Select.Option
const { toContentState } = Mention;
let ID = 0
const getUUID = () => ID++
const ALL_MAN = [
  '吴小康', '桂恩来', '刘冰源', '陈凯', '崔明波', '陆峰', '魏明亮', '张野', '刘鑫', '辛希云', '路扬'
]
class Plan extends React.Component {
  constructor(props) {
    super(props)
    this.state = this.initState()
  }
  initMission = () => ({
    desc: '', time: 1, key: getUUID()
  })
  initState = (data = {}) => {
    let allMembers = store.get('members')
    allMembers = allMembers ? allMembers.split(',') : ALL_MAN
    let historyArchive = store.get('historyArchive')
    historyArchive = historyArchive ? JSON.parse(historyArchive) : []
    let members = data.members
    delete data.members
    let newStart = data.start

    if(newStart){
      Object.keys(newStart).forEach(key => {
        newStart[key] = moment(newStart[key])
      })
      delete data.start
    }
    return {
      title: '排期计划',
      members: toContentState(members || '@Sinclair'),
      mission: {
        Sinclair: [this.initMission()],
      },
      start: newStart || {
        Sinclair: moment().set('hour', 8),
      },
      unit: 0.2,
      noSatDay: true,
      noSunDay: true,
      allMembers,
      visible: false,
      docShow: true,
      historyArchive,
      activeArchive:'',
      ...data,
    }
  }
  // 合计时间
  getTime = () => {
    let { mission, start } = this.state
    let startTime = moment.min(Object.values(start))
    let timeArr = Object.entries(mission).map(([p, ms]) => start[p].clone().add(ms.reduce((a, b) => a + b.time, 0), 'days'))
    let endTime = moment.max(timeArr)
    let sumDays = Math.ceil((endTime - startTime) / 1000 / 3600 / 24) + 1
    let sumTimes = +Object.entries(mission).map(([p, ms]) => ms.reduce((a, b) => a + b.time, 0)).reduce((a,b) => a+b, 0).toFixed(1)
    return {
      sumDays,
      startTime,
      endTime,
      sumTimes
    }
  }
  renderRow = (p, m, index) => {
    let { unit, mission, start } = this.state
    let {
      sumDays, startTime
    } = this.getTime()
    // 合计时间 向下取整 得到天数
    let timeTd = new Array(Math.ceil(sumDays / unit)).fill(1)
    let { time } = m
    let curStartTime = start[p]
    let startDays = +((curStartTime - startTime) / 1000 / 3600 / 24).toFixed(1)
    if (startDays === 0) {
      startDays = curStartTime.diff(startTime.clone().set('hour', 8), 'hour') / 10
    }
    let beforeDays = mission[p].filter((v, i) => i < index)
    beforeDays = startDays + (!beforeDays.length ? 0 : beforeDays.reduce((a, b) => a + b.time, 0))
    let endTime = beforeDays + time
    return (
      <tr key={`${p}-${this.missionLength}`}>
        <td>{this.missionLength++}</td>
        <td>{m.desc}</td>
        <td style={{textAlign:'center'}}>{m.time}</td>
        {
          timeTd.map((v, i) => <td key={i} style={{
            background: i >= beforeDays / unit && i < endTime / unit ? 'green' : 'white'
          }} />)
        }
        <td>{p}</td>
      </tr>
    )
  }
  renderTable() {
    const { title, mission, unit } = this.state
    let { sumDays, startTime, sumTimes } = this.getTime()
    let timeTd = new Array(sumDays).fill(1)
    this.missionLength = 1
    return (
      <table ref={ref => this.table = ref}>
        <thead>
          <tr><td colSpan={4 + timeTd.length / unit} style={{ textAlign: 'center' }}>{title}</td></tr>
          <tr>
            <td rowSpan={2}>No.</td>
            <td rowSpan={2} style={{ width: 150 }}>任务</td>
            <td rowSpan={2}>人日</td>
            <td colSpan={timeTd.length / unit}>时间</td>
            <td rowSpan={2} style={{ width: 50 }}>责任人</td>
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
            <td>{sumTimes}</td>
            <td colSpan={1 + timeTd.length / unit}>-</td>
          </tr>
        </tfoot>
      </table>
    )
  }
  // 根据设置过滤周末
  getWordDay = (time, i, max) => {
    if (i === 0) {
      this.passWeekends = 0
    }
    let nextDay = time.clone().add(i + 2 * this.passWeekends, 'days')
    let week = nextDay.format('d')
    if (this.state.noSatDay && week === '6') { // 周六
      this.passWeekends += 0.5
      nextDay.add(1, 'days')
    }
    week = nextDay.format('d')
    if (this.state.noSunDay && week === '0') { // 周日
      this.passWeekends += 0.5
      nextDay.add(1, 'days')
    }
    week = nextDay.format('d')
    let isWeekend = week === '0' || week === '6'
    return (
      <td
        key={i}
        colSpan={1 / this.state.unit}
        style={{ background: isWeekend && '#1890ff' }}>
        {nextDay.format('MM/DD')}
      </td>
    )
  }
  // 添加/删除 任务
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
  // 一级state的onchange
  onSimpleChange = key => e => {
    let value = e && e.target ? e.target.value : e
    this.setState({
      [key]: value
    })
  }
  // 项目成员onChange
  onMembersChange = members => {
    let { mission, start } = this.state
    let newMission = {}, newStart = {}
    let memberArr = Mention.getMentions(members).map(v => v.replace('@', ''))
    memberArr.forEach(m => {
      if (mission[m]) {
        newMission[m] = mission[m]
        newStart[m] = start[m]
      } else {
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
  // 具体任务onChange
  onMissionChange = (p, index, key) => e => {
    let value = e && e.target ? e.target.value : e
    let { mission } = this.state
    mission[p][index][key] = value
    this.setState({
      mission: {
        ...mission
      }
    })
  }
  // 开始时间onChange
  onStartChange = (p) => e => {
    let value = e && e.target ? e.target.value : e
    let { start } = this.state
    start[p] = value
    this.setState({
      start: { ...start }
    })
  }
  onSave = () => {
    let { historyArchive, title, members, start, mission, unit, noSatDay, noSunDay } = this.state
    if (!historyArchive.find(v => v === title)) {
      historyArchive.push(title)
    }
    let newStart = {}
    Object.entries(start).forEach(([key, value]) => newStart[key] = value.format('YYYY-MM-DD HH'))
    store.set(title, JSON.stringify({
      title, members: Mention.toString(members), start: newStart, mission, unit, noSatDay, noSunDay
    }))
    store.set('historyArchive', JSON.stringify(historyArchive))
    this.setState({
      historyArchive: [...historyArchive]
    },() => {
      message.success('存档成功！')
    })
  }
  onLoadArchive = (key) => {
    let data = store.get(key)
    data = data ? JSON.parse(data) : {}
    let state = this.initState(data)
    state.activeArchive = key
    this.setState(state, () => {
      message.success('加载存档成功！')
    })
  }
  cancelArchive = (key) => e => {
    e && e.stopPropagation()
    store.remove(key)
    let { historyArchive} = this.state
    let index = historyArchive.findIndex(v => v === key)
    if(index > -1){
      historyArchive.splice(index, 1)
    }
    store.set(historyArchive, JSON.stringify(historyArchive))
    this.setState({
      historyArchive: [...historyArchive]
    }, () => {
      message.success('删除存档成功！')
    })
  }
  // 渲染表单
  renderForm = () => {
    const disabledHours = [1, 2, 3, 4, 5, 6, 7, 19, 20, 21, 22, 23, 23, 24, 0]
    const members = Mention.getMentions(this.state.members).map(v => v.replace('@', ''))
    const { title, unit, start, noSatDay, noSunDay, docShow, allMembers, historyArchive } = this.state
    return (
      <Flex dir="column" align="stretch">
        <Flex dir="column" align="stretch" style={{ height: 'calc(100% - 50px)' }} className="plan-form">
          <Divider><h1><a href="https://github.com/Sinclair8023/work-plan">排期表单</a></h1></Divider>
          <h3>说明（点击右侧图标可以折叠）：<Button onClick={() => this.setState({ docShow: !docShow })} icon="double-right" style={{ transform: `rotate(${docShow ? -90 : 90}deg)` }} /></h3>
          <ul>
            <li>排期成员：输入’@+姓名‘增加成员,输入空格结束。输入’@‘会有提示，提示信息可以通过维护所有成员维护</li>
            {
              docShow ? (
                <Fragment>
                  <li>关于本项目：<a href="https://github.com/Sinclair8023/work-plan">点击链接跳转到github项目地址。</a></li>
                  <li>排期刻度：以’工作日‘为单位，最小0.1工作日，最大1工作日</li>
                  <li>过滤周六：开启后，排期时间自动跨过周六</li>
                  <li>过滤周日：开启后，排期时间自动跨过周日</li>
                  <li>开始时间：开始时间不能选择当前之前的时间，最小精确到时，选择范围为每天的8：00-18：00（10个小时对应最小排期刻度0.1）</li>
                  <li>排期任务：每个排期任务需要输入具体任务描述，选择好任务所需时间。</li>
                  <li>复制表格 ：点击复制表格可以复制表格到剪贴板。</li>
                  <li>存档 ：可以保存当前的排期设置，点击历史存档可以切换/删除，会覆盖之前同名的排期。</li>
                  <li>维护所有成员：点击维护成员枚举，方便快速添加排期成员（维护之后长期有效）。</li>
                  <li>关于保存数据：所有的持久存储都保存在localstorage中，最大保存5M左右数据。</li>
                </Fragment>
              ) : <li>......</li>
            }
          </ul>
          <Flex>
            <label htmlFor="">历史存档</label>
            <Select style={{width: '100%'}} defaultValue={this.state.activeArchive} onChange={this.onLoadArchive}>
              {
                historyArchive.map(label => <Option value={label}>{label} <Button style={{float:'right'}} ghost icon={'close'} onClick={this.cancelArchive(label)} /></Option>)
              }
            </Select>
          </Flex>
          <Flex>
            <label htmlFor="">排期内容</label>
            <Input value={title} onChange={this.onSimpleChange('title')} />
          </Flex>
          <Flex>
            <label htmlFor="">排期成员</label>
            <Mention
              style={{ width: '100%' }}
              suggestions={allMembers}
              value={this.state.members}
              onChange={this.onMembersChange}
            />
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
            <Flex width="50%">
              <label htmlFor="">过滤周六</label>
              <Switch checked={noSatDay} onChange={this.onSimpleChange('noSatDay')} />
            </Flex>
            <Flex>
              <label htmlFor="">过滤周日</label>
              <Switch checked={noSunDay} onChange={this.onSimpleChange('noSunDay')} />
            </Flex>
          </Flex>

          <Tabs>
            {
              members.map((p, i) => (
                <TabPane tab={p} key={i}>
                  <Flex dir="column" align="stretch" height={400} style={{ overflowY: 'auto' }}>
                    <Flex align="center" height={50}>
                      {p}同学排期开始于
                    <DatePicker
                        format="MM/DD HH"
                        allowClear={false}
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
                        <Flex height={50}>
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
        <Flex style={{ height: 50 }} justify="center">
          <ButtonGroup>
            <Button icon="edit" type="primary" onClick={() => this.onSimpleChange('visible')('true')}>维护所有成员</Button>
            <Button icon="copy" type="primary" onClick={() => this.onCopy()}>复制表格</Button>
            <Button icon="copy" type="primary" onClick={() => this.onSave()}>存档</Button>
          </ButtonGroup>
        </Flex>
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
    message.success('排期表格已成功复制到剪贴板！')
  }
  // echarts option
  getOption = () => {
    let { mission } = this.state
    let legendData, data
    let members = Object.keys(mission)
    if (members.length > 1) {
      legendData = members
      data = Object.entries(mission).map(([k, v]) => {
        let sumTime = v.length ? v.reduce((a, b) => a + b.time, 0) : 0
        return { value: sumTime, name: k }
      })
    } else {
      legendData = members[0]
      data = mission[members[0]].map(v => ({ value: v.time, name: v.desc }))
    }
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
        data: legendData
      },
      series: {
        name: '用时',
        type: 'pie',
        radius: '55%',
        center: ['50%', '60%'],
        data,
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
  onSaveAllMembers = () => {
    let allMembers = this.allMembersTextArea.textAreaRef.value
    let members = allMembers.replace(/,|，| /g, ',').split(',')
    if (members.length) {
      store.set('members', members)
    }
    this.setState({
      allMembers: members,
      visible: false,
    }, () => {
      message.success('全部成员已跟新！')
    })
  }
  render() {
    return (
      <div className="planBox">
        <Modal title="维护所有成员"
          visible={this.state.visible}
          onOk={() => this.onSaveAllMembers()}
          onCancel={() => this.onSimpleChange('visible')(false)}
        >
          <h3>说明：各个成员间以中英文逗号或者空格隔开。</h3>
          <TextArea
            ref={ref => this.allMembersTextArea = ref} 
            row={4}
            defaultValue={this.state.allMembers.join('，')}
          />
        </Modal>
        {
          this.renderForm()
        }
        <div className="plan-table">
          <div style={{ height: 500, overflowY: 'scroll' }}>
            <Divider><h1>表格</h1></Divider>
            {this.renderTable()}
          </div>
          <div>
            <Divider><h1>排期分析</h1></Divider>
            {
              Object.keys(this.state.mission).length && (
                <ReactEcharts
                  option={this.getOption()}
                  notMerge={true}
                  lazyUpdate={true}
                  theme={"theme_name"}
                  className="plan-chart"
                />
              )
            }
          </div>
        </div>
      </div>
    )
  }
}
export default Plan