#  Platform Choices and Design Demands for IoT Platforms: Cost, Power, and Performance Tradeoffs

```
@article{chen2016platform,
  title={Platform choices and design demands for IoT platforms: cost, power, and performance tradeoffs},
  author={Chen, Deming and Cong, Jason and Gurumani, Swathi and Hwu, Wen-mei and Rupnow, Kyle and Zhang, Zhiru},
  journal={IET Cyber-Physical Systems: Theory \& Applications},
  volume={1},
  number={1},
  pages={70--77},
  year={2016},
  publisher={IET}
}
```

## One Sentence
This paper describes a CAD framework for designing IoT platforms with off-the-shelf or custom components, with a joint-objective of optimizing performance, cost and power.

"... we present a generic IoT device design flow and discuss platform choices available for IoT devices to efficiently tradeoff cost, power, performance and volume constraints."

## Key Points
Overview
> "Despite the generally parallel development processes, the software and hardware design flows influence each other; software algorithm demands may alter hardware performance objectives, and hardware implementation choices can influence how software is designed and implemented."

> "Many IoT applications begin with prototyping entirely in software on existing embedded platforms."

> "At a high-level, the design flow consists of three phases: system-level design, software-hardware co-development and system integration and implementation."

> "... we primarily concentrate on design automation for the hardware portion of the device design flow ..."

The initial 'pre-prototype'
> "... the first prototypes assist in identifying platform computation needs, and the feasibility of meeting quality goals within the performance, power, and size limitations of existing platforms"

> "... the initial pre-prototyhpe quickly identifies a need for greater performance than a CPU-only embedded system can provide, ..."


System-in-Package vs. System-on-Chip
> "Custom platform can either be System-in-Package (SiP) solution or a System-on-Chip (SoC) device. System-in-Pakcage may refer to a variety of packaging technologies that tightly integrate multiple chip dies into a single package. The tight integration of multiple dies reduces power and energy of the devices, reduces the PCB size by integrating multiple chips into a single package, and can improve performance by rendering intercommunication latency."

> "To achieve performance and power/energy efficiency infeasible with standard or existing platforms, developers turn to custom System-on-Chip solutions. In addition to improved features, performance and power, SoC-based solutions have the advantage of lower per-unit costs at volume."

Two SoC-based designs:
> "CPU customizations that extend the instruction set of a CPU, and full custom designs that create standalone application specific hardware--sometimes with a CPU to handle control, error processing or interfacing."

> "Custom CPUs not only improve performance and power efficiency, but also create feature differentiation and IP protection: a competitor cannot simply copy platform software because the ISA extensions require the custom CPU implementation."

Why CAD:
> "Automating this mapping is critical to allowing extensive design space exploration, as manual mapping would render the exploration too costly."

> "In COTS [commercial off-the-shelf]-based systems, automated mapping of software to hardware platforms was needed to effectively perform system-level modeling and determine optimal performance and power/energy mapping the application to candidate system designs."

> "CAD to automatically translate high-level descriptions of extensions and generate area, performance, and power estimates are critical; these estimates must be fast and inexpensive to produce, yet have sufficient correlation with real implementation results to acurately guide decision making."


## Take-Away
* This paper seems to be trying to fit a system/architecture design framework on the topic of IoT, advocating CAD as a way to overcome the laborious alternative of manually exploring a design space.