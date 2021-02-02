/*
 * Copyright 1999-2021 Alibaba Group Holding Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from "react";
import {Col, Row, Table} from "antd";
import {getSearchForm} from "../../../libs/Search";
import {GenPagination} from "../../../libs/Pagination";
import Actions from "../../../actions/Actions";
import {connect} from "react-redux";
import {FormattedMessage} from "react-intl";
import MachineOperation from "../libs/MachineOperation";
import MachineConstants from "../../../constants/MachineConstants";
import styles from "./index.module.scss";

const PodInputSearchField = [
    {
        key: "node",
        name: "node",
        label: "节点名",
        placeholder: "请填写节点名"
    },
    {
        key: "namespace",
        name: "namespace",
        label: "Namespace",
        placeholder: "请填写 Namespace"
    },
    {
        key: "pod",
        name: "pod",
        label: "Pod 名",
        placeholder: "请填写 Pod 名"
    }, {
        key: "ip",
        name: "ip",
        label: "Pod IP",
        placeholder: "请填写 Pod IP"
    }
]

const SelectSearchField = [
    {
        key: "status",
        name: "status",
        label: "状态",
        placeholder: "请选择状态",
        options: [
            MachineConstants.MACHINE_STATUS_ONLINE,
            MachineConstants.MACHINE_STATUS_BANING,
        ]
    },
]

class PodList extends React.Component {
    formRef = React.createRef()
    static defaultProps = {
        InputSearchFields: PodInputSearchField,
        SelectSearchFields: SelectSearchField,
    }

    componentDidMount() {
        const {query, page, pageSize, getMachinesForPodPageable} = this.props;
        getMachinesForPodPageable({...query, page: page, pageSize: pageSize})
    }

    constructor(props) {
        super(props);
        this.state = {
            query: props.query || {},
        };
    }

    onFinish = (values) => {
        const {query, page, pageSize, getMachinesForPodPageable} = this.props
        getMachinesForPodPageable({...query, page: page, pageSize: pageSize, ...values})
    };

    render() {
        const {loading, page, pageSize, total, machines, query, getMachinesForPodPageable} = this.props
        return (
            <div>
                {getSearchForm(this)}
                <Table columns={this.PodColumns}
                       dataSource={loading ? [] : machines}
                       rowKey="machineId"
                       loading={loading}
                       pagination={GenPagination(page, pageSize, total,
                           (page, pageSize) => getMachinesForPodPageable({...query, page, pageSize}))}
                />
            </div>
        );
    }

    PodColumns = [
        {
            title: <FormattedMessage id={"page.machine.host.column.title.index"}/>,
            key: "index",
            render: (text, record, index) => `${index + 1}`
        },
        {
            title: <FormattedMessage id={"page.machine.host.column.title.machineId"}/>,
            dataIndex: "machineId",
            key: "machineId",
            className: `${styles.hidden}`
        },
        {
            title: '节点名',
            dataIndex: 'nodeName',
            key: 'nodeName',
        },
        {
            title: 'Namespace',
            dataIndex: 'namespace',
            key: 'namespace',
        },
        {
            title: 'Pod 名称',
            dataIndex: 'podName',
            key: 'podName',
        },
        {
            title: 'Pod IP',
            dataIndex: 'podIp',
            key: 'podIp',
        },
        {
            title: 'Pod 状态',
            dataIndex: 'status',
            key: 'status',
            render: (text, record) => (
                <FormattedMessage id={MachineConstants.MACHINE_STATUS[text]}/>
            ),
        },
        {
            title: '容器列表',
            dataIndex: 'containers',
            key: 'containers',
            render: text => {
                return (
                    text.map(container => {
                        return (<Row><Col span={12}>{container}</Col></Row>);
                    })
                );
            }
        },
        {
            title: '是否演练过',
            dataIndex: 'chaosed',
            key: 'chaosed',
            render: text => {
                return text ? '是' : '否'
            },
        },
        {
            title: '最近演练时间',
            dataIndex: 'chaosTime',
            key: 'chaosTime',
        },
        {
            title: '操作',
            key: 'action',
            render: (text, record) => {
                return (
                    <MachineOperation
                        unbanMachine={this.props.unbanMachine.bind(this)}
                        banMachine={this.props.banMachine.bind(this)}
                        record={record}/>
                );
            }
        },
    ]
}

const mapStateToProps = state => {
    const machine = state.machine.toJS();
    let {pods} = machine
    return {
        loading: pods.loading,
        refreshing: pods.refreshing,
        machines: pods.machines,
        pageSize: pods.pageSize,
        page: pods.page,
        pages: pods.pages,
        total: pods.total,
    }
}

const mapDispatchToProps = dispatch => {
    return {
        getMachinesForPodPageable: query => dispatch(Actions.getMachinesForPodPageable(query)),
        banMachine: machineId => dispatch(Actions.banMachine(machineId)),
        unbanMachine: machineId => dispatch(Actions.unbanMachine(machineId)),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(PodList)