import {Component} from 'react';
import Paper from '@mui/material/Paper';
import { ViewState,IntegratedEditing,EditingState } from '@devexpress/dx-react-scheduler';
import {
  Scheduler,
  MonthView ,
  Toolbar,
  DateNavigator,
  TodayButton,
  Appointments,
  AppointmentTooltip,
  AppointmentForm,
  ConfirmationDialog
} from '@devexpress/dx-react-scheduler-material-ui';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import 'primeicons/primeicons.css';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.css';

interface dataProps {
  startDate: string|Date;
  endDate:string|Date;
  id:any;
  title?:string;
  [key:string]:any
}

export default class App extends Component<{},{data:dataProps[],currentDate:any,dialogVisible:boolean,countStartDate?:Date,countEndDate?:Date,countedHours?:number}>{
  constructor(props:any) {
    super(props);
    this.state = {
      data: JSON.parse(window.localStorage?.scheduledHours??"{}")?.data??[],
      currentDate: new Date(),
      dialogVisible:false
    };

    this.commitChanges = this.commitChanges.bind(this);
  }
  commitChanges({ added, changed, deleted }:any) {
    this.setState((state) => {
      let { data } = state;
      if (added) {
        const startingAddedId = data.length > 0 ? data[data.length - 1].id + 1 : 0;
        data = [...data, { id: startingAddedId, ...added }];
      }
      if (changed) {
        data = data.map((appointment:any) => (
          changed[appointment.id] ? { ...appointment, ...changed[appointment.id] } : appointment));
      }
      if (deleted !== undefined) {
        data = data.filter((appointment:any) => appointment.id !== deleted);
      }
      window.localStorage.scheduledHours=JSON.stringify({data})
      return { data };
    });
  }
  setAutoTitle(a:any){
    if(!a.startDate || !a.endDate)return
    a.title= ((new Date(a.endDate).getTime()-new Date(a.startDate).getTime())/(1000*60*60)).toFixed(1)
  }
  renderFooterDialog(){
    return (
      <div>
          <Button label="Close" icon="pi pi-times" onClick={() => this.hideDialog()} className="p-button-text" />
      </div>
  );
  }
  hideDialog(){
    this.setState({dialogVisible:false})
  }
  showDialog(){
    this.setState({dialogVisible:true,countedHours:0})
  }
  countSelectedHours(){
    let start = this.state.countStartDate
    let end = this.state.countEndDate
    if(!start||!end)return
    let data=this.state.data.filter(d=>new Date(d.startDate).getTime()>start!.getTime()&&new Date(d.endDate).getTime()<end!.getTime())
    let count = data.reduce((last,next)=>(new Date(next.endDate).getTime()-new Date(next.startDate).getTime())+last,0)
    this.setState({countedHours:Number((count/(1000*60*60)).toFixed(1))})
  }
  render(){
    const { currentDate, data } = this.state;
    return(
      <>
      <Paper>
        <Scheduler
          data={data}
          height={700}
          locale={'it'}
          firstDayOfWeek={1}
        >
          <ViewState
            currentDate={currentDate}
          />
          <EditingState
            onCommitChanges={this.commitChanges}
            onAppointmentChangesChange={this.setAutoTitle}
            onAddedAppointmentChange={this.setAutoTitle}
          />
          <IntegratedEditing  />

          <MonthView/>
          <Toolbar/>
          <DateNavigator/>
          <TodayButton/>
          <Appointments />
          <ConfirmationDialog
            ignoreCancel
          />
          <AppointmentTooltip
            showOpenButton
            showDeleteButton
          />
          <AppointmentForm/>
        </Scheduler>
      </Paper>
      <br/><br/>
      <Button label="Conteggio ore" icon="pi pi-spinner" className="p-button-success" iconPos="right" onClick={()=>this.showDialog()} />
      <Dialog header="Conteggio ore" footer={this.renderFooterDialog.call(this)} modal visible={this.state.dialogVisible} style={{minWidth: '50vw',maxWidth:'95vw'}} onHide={()=>this.hideDialog()}>
        <br/><br/>
        <div style={{display:'flex',gap:'2rem'}}>
          <div className="field col-12 md:col-4">
            <span className="p-float-label">
                <Calendar id="countStartDate" value={this.state.countStartDate} onChange={(e) => this.setState({countStartDate:(e.value as Date|undefined)})} />
                <label htmlFor="countStartDate">Data inizio</label>
            </span>
          </div>
          <div className="field col-12 md:col-4">
            <span className="p-float-label">
                <Calendar id="countEndDate" value={this.state.countEndDate} onChange={(e) => this.setState({countEndDate:(e.value as Date|undefined)})} />
                <label htmlFor="countEndDate">Data fine</label>
            </span>
          </div>
          <div className="field col-12 md:col-4">
            <Button label="Calcola" icon="pi pi-calendar" className="p-button-help" iconPos="right" onClick={()=>this.countSelectedHours()} />
          </div>
        </div>
        <br/><br/>
        <span>{this.state.countedHours}</span>
      </Dialog>
      </>
    )
  }
}
//export default App
